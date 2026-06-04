// ============================================================
// EL FARO — sync.js  (sincronización Firebase)
// ============================================================
let DB = null;
let SESSION_KEY = null;

function firebaseConfigured() {
  return typeof FIREBASE_CONFIG !== 'undefined' &&
    FIREBASE_CONFIG.databaseURL &&
    !FIREBASE_CONFIG.databaseURL.includes('PEGA_TU');
}

function initFirebase() {
  if (!firebaseConfigured()) { updateSyncUI('local'); return; }
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    DB = firebase.database();
    DB.ref('.info/connected').on('value', snap => {
      updateSyncUI(snap.val() === true ? 'online' : 'offline');
    });
  } catch(e) { console.warn('Firebase error:', e); updateSyncUI('local'); }
}

function setSessionKey(date, location) {
  SESSION_KEY = (date + '_' + location)
    .replace(/\//g,'-').replace(/\s+/g,'').replace(/[^a-zA-Z0-9_\-]/g,'');
  return SESSION_KEY;
}

function subscribeToSession(key, onData) {
  if (!DB) return;
  SESSION_KEY = key;
  DB.ref('sessions/' + key).on('value', snap => {
    const data = snap.val();
    if (data) onData(data);
  });
}

function syncPatient(patient) {
  if (!DB || !SESSION_KEY) return;
  DB.ref('sessions/' + SESSION_KEY + '/patients/' + patient.id).set(patient)
    .then(() => updateSyncUI('online'))
    .catch(() => updateSyncUI('offline'));
}

function syncInventory(inventory, meds, initInventory) {
  if (!DB || !SESSION_KEY) return;
  DB.ref('sessions/' + SESSION_KEY + '/inventory').set({ inventory, meds, initInventory })
    .catch(e => console.warn(e));
}

function syncFullState(state) {
  if (!DB || !SESSION_KEY) return;
  DB.ref('sessions/' + SESSION_KEY).set({
    patients: state.patients || [],
    inventory: state.inventory,
    meds: state.meds,
    initInventory: state.initInventory,
    actLoc: state.actLoc,
    actDate: state.actDate,
    lastSync: new Date().toISOString(),
  }).then(() => updateSyncUI('online')).catch(() => updateSyncUI('offline'));
}

function updateSyncUI(status) {
  const el = document.getElementById('sync-bar');
  if (!el) return;
  const loc = window.S?.actLoc || '';
  const dt  = window.S?.actDate || '';
  if (status === 'online') {
    el.className = 'sync';
    el.textContent = `🔥 Sincronizado · ${loc} · ${dt}`;
  } else if (status === 'offline') {
    el.className = 'sync sync-off';
    el.textContent = '⚠ Sin conexión — guardando localmente';
  } else {
    el.className = 'sync';
    el.textContent = `💾 Modo local · ${loc} · ${dt}`;
  }
}

async function exportToSheets(state, sheetsUrl) {
  if (!sheetsUrl || sheetsUrl.includes('REEMPLAZA')) return false;
  try {
    const inv = (state.meds || []).map(m => ({
      name: m.n, unit: m.u,
      initial: state.initInventory?.[m.id] || 0,
      current: state.inventory?.[m.id] || 0,
    }));
    await fetch(sheetsUrl, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'export_all', data: { patients: state.patients, inventory: inv } }),
    });
    return true;
  } catch(e) { return false; }
}

window.addEventListener('online', () => { if (DB) updateSyncUI('online'); });
