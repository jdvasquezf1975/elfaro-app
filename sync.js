// ============================================================
// EL FARO — sync.js  v2  (sincronización Firebase mejorada)
// ============================================================
let DB = null;
let SESSION_KEY = null;
let _syncToast = null;

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

function setSessionKey(jornadaNum, location) {
  // Key = jornadaNum + location, normalized
  const normalize = str => str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\//g,'-').replace(/\s+/g,'')
    .replace(/[^a-zA-Z0-9_\-]/g,'');
  SESSION_KEY = 'J' + normalize(jornadaNum) + '_' + normalize(location||'');
  return SESSION_KEY;
}

function subscribeToSession(key, onData) {
  if (!DB) return;
  SESSION_KEY = key;
  // Escucha cambios en tiempo real — cualquier escritura de cualquier dispositivo
  // dispara este callback en todos los demás instantáneamente
  DB.ref('sessions/' + key).on('value', snap => {
    const data = snap.val();
    if (data) onData(data);
  });
}

// Sincroniza UN paciente (más rápido que full state)
function syncPatient(patient) {
  if (!DB || !SESSION_KEY) return;
  DB.ref('sessions/' + SESSION_KEY + '/patients/' + patient.id)
    .set(patient)
    .then(() => {
      updateSyncUI('online');
      showSyncToast('✓ Sincronizado con todos los dispositivos');
    })
    .catch(() => updateSyncUI('offline'));
}

function syncInventory(inventory, meds, initInventory) {
  if (!DB || !SESSION_KEY) return;
  DB.ref('sessions/' + SESSION_KEY + '/meta').set({ inventory, meds, initInventory })
    .catch(e => console.warn(e));
}

// Empuja el estado completo — pacientes + inventario
function syncFullState(state) {
  if (!DB || !SESSION_KEY) return;
  const patientsObj = {};
  (state.patients || []).forEach(p => { if (p.id) patientsObj[p.id] = p; });
  DB.ref('sessions/' + SESSION_KEY).set({
    patients: patientsObj,
    inventory: state.inventory,
    meds: state.meds,
    initInventory: state.initInventory,
    actLoc: state.actLoc,
    actDate: state.actDate,
    villages: state.villages || [],
    operators: state.operators || [],
    almacen: state.almacen || [],
    jornadaNum: state.jornadaNum || '',
    lastSync: new Date().toISOString(),
  })
  .then(() => {
    updateSyncUI('online');
    showSyncToast('✓ Sincronizado con todos los dispositivos');
  })
  .catch(() => updateSyncUI('offline'));
}

// ── UI ────────────────────────────────────────────────────────────────────
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

// Toast verde de confirmación de sync
function showSyncToast(msg) {
  clearTimeout(_syncToast);
  const el = document.getElementById('sync-bar');
  if (!el) return;
  const loc = window.S?.actLoc || '';
  const dt  = window.S?.actDate || '';
  el.className = 'sync sync-ok';
  el.textContent = msg;
  _syncToast = setTimeout(() => {
    el.className = 'sync';
    el.textContent = `🔥 Sincronizado · ${loc} · ${dt}`;
  }, 3000);
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
