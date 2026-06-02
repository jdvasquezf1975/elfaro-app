// ============================================================
// EL FARO — app.js
// ⚠️ CONFIGURACIÓN REQUERIDA:
// 1. Sube el código de google_apps_script.js a script.google.com
// 2. Despliégalo como Aplicación Web
// 3. Reemplaza la URL de abajo con la que te da Google
// 4. Sube logo-faro.jpg a la misma carpeta que este archivo
// ============================================================

const SHEETS_URL = 'https://script.google.com/macros/s/https://script.google.com/macros/s/AKfycby9BgGbCdOrw49tTL3F5RcdXfgV3N8xJztBqVPA4yn6gVZx4ExlGN79TvNAzZYpjfs/exec';
const LOGO_PATH  = 'logo-faro.jpg'; // Renombra tu Logo_Faro.jpg a logo-faro.jpg

// ── CONFIG ────────────────────────────────────────────────────────────────
const PINS = { inscripcion:'1111', medico:'2222', farmacia:'3333', espiritual:'4444', admin:'9999' };

const T = {
  es:{appSub:'Jornada Médica Móvil',pinFor:'PIN de',back:'Volver',pinErr:'PIN incorrecto',
    ins:'Inscripción',inD:'Registro de pacientes',med:'Médicos',meD:'Diagnóstico y receta',
    far:'Farmacia',faD:'Despacho de medicina',esp:'Clínica Espiritual',esD:'Seguimiento espiritual',
    adm:'Admin',adD:'Inventario y reportes',exit:'← Salir',
    nom:'Nombre completo',nomPh:'Nombre y apellido',edad:'Edad',edPh:'años',gen:'Género',
    masc:'Masculino',fem:'Femenino',tel:'Teléfono',telPh:'####-####',
    aldea:'Aldea del paciente',
    emb:'Embarazada',pec:'Dando pecho',vit:'Signos vitales',
    bp:'Presión',pls:'Pulso',res:'Resp',pes:'Peso lb',tmp:'Temp °F',
    sim:'Síntomas',cond:'Condiciones',
    fie:'Fiebre',dia:'Diarrea',cab:'Dolor cabeza',art:'Dolor articular',tos:'Tos',
    diab:'Diabetes',ref:'Referidos',reg:'Registrar →',
    hoy:'Hoy',nvo:'Nueva ficha',
    esp2:'En espera',ate:'En consulta',rxst:'Con receta',ent:'Entregado',mod:'Modificado',
    dx:'Diagnóstico',dxPh:'Ej: Faringoamigdalitis',not:'Notas médico',notPh:'Observaciones...',
    rec:'Receta',envRx:'Enviar receta a farmacia →',vCola:'← Cola',
    pend:'Recetas pendientes',cfm:'✓ Confirmar entrega completa',chkAll:'Marcar todos',
    inv:'Inventario',grd:'Guardar',sinP:'Sin pacientes hoy',sinPe:'Sin recetas pendientes',sinC:'Sin pacientes en espera',
    dxTitle:'Diagnósticos más frecuentes',dxNone:'Sin diagnósticos aún',
    pr:'Hizo la oración',prPh:'Oró durante la visita',cr:'Aceptó a Cristo',crPh:'Tomó la decisión de aceptar',
    rc:'Se reconcilió',rcPh:'Restauración de su fe',ct:'Interesado en contacto',ctPh:'Desea ser contactado',
    gEsp:'Guardar info espiritual',nEsp:'Notas pastorales',
    alds:'Aldeas',addAPh:'Nombre de la aldea',agr:'Agregar',
    a0:'0-12',a1:'13-17',a2:'18-35',a3:'36-59',a4:'60+',
    tP:'Pacientes',ents:'Entregados',sinMed:'Sin medicamentos despachados',
    stockLbl:'Stock',stockAfter:'Quedarán',
    newMed:'Agregar medicamento',newMedNom:'Nombre',newMedUnit:'Unidad',newMedQty:'Cantidad inicial',
    setupLoc:'Aldea de la jornada',setupDate:'Fecha',setupBtn:'Iniciar jornada →',
    modBtn:'✏️ Modificar / agregar medicamento',modTitle:'Modificación de receta',
    modNote:'Nota de modificación',modNotePh:'Ej: Requiere medicamento adicional...',
    modSend:'Enviar adición a farmacia →',histTitle:'Historial de entregas',entrega:'Entrega',
    exportBtn:'↑ Exportar todo a Google Sheets',exportCSV:'↓ Descargar CSV',syncOk:'Sincronizado',syncOff:'Sin conexión',
  },
  en:{appSub:'Mobile Medical Mission',pinFor:'PIN for',back:'Back',pinErr:'Incorrect PIN',
    ins:'Registration',inD:'Patient check-in',med:'Doctors',meD:'Diagnosis & prescription',
    far:'Pharmacy',faD:'Medication dispensing',esp:'Spiritual Clinic',esD:'Spiritual follow-up',
    adm:'Admin',adD:'Inventory & reports',exit:'← Exit',
    nom:'Full name',nomPh:'First and last name',edad:'Age',edPh:'yrs',gen:'Gender',
    masc:'Male',fem:'Female',tel:'Phone',telPh:'####-####',
    aldea:"Patient's village",
    emb:'Pregnant',pec:'Breastfeeding',vit:'Vital Signs',
    bp:'BP',pls:'Pulse',res:'Resp',pes:'Weight lb',tmp:'Temp °F',
    sim:'Symptoms',cond:'Conditions',
    fie:'Fever',dia:'Diarrhea',cab:'Headache',art:'Joint pain',tos:'Cough',
    diab:'Diabetes',ref:'Referrals',reg:'Register →',
    hoy:'Today',nvo:'New form',
    esp2:'Waiting',ate:'In consult',rxst:'Prescribed',ent:'Delivered',mod:'Modified',
    dx:'Diagnosis',dxPh:'E.g. Acute pharyngitis',not:"Doctor's notes",notPh:'Observations...',
    rec:'Prescription',envRx:'Send to pharmacy →',vCola:'← Queue',
    pend:'Pending prescriptions',cfm:'✓ Confirm delivery',chkAll:'Check all',
    inv:'Inventory',grd:'Save',sinP:'No patients today',sinPe:'No pending',sinC:'No patients waiting',
    dxTitle:'Most common diagnoses',dxNone:'No diagnoses yet',
    pr:'Prayed',prPh:'Patient prayed',cr:'Accepted Christ',crPh:'Made decision',
    rc:'Reconciled',rcPh:'Restored faith',ct:'Interested in follow-up',ctPh:'Wants contact',
    gEsp:'Save spiritual info',nEsp:'Pastoral notes',
    alds:'Villages',addAPh:'Village name',agr:'Add',
    a0:'0-12',a1:'13-17',a2:'18-35',a3:'36-59',a4:'60+',
    tP:'Patients',ents:'Delivered',sinMed:'No medications dispensed',
    stockLbl:'Stock',stockAfter:'Will remain',
    newMed:'Add medication',newMedNom:'Name',newMedUnit:'Unit',newMedQty:'Initial qty',
    setupLoc:'Session village',setupDate:'Date',setupBtn:'Start session →',
    modBtn:'✏️ Modify / add medication',modTitle:'Prescription modification',
    modNote:'Modification note',modNotePh:'E.g. Patient needs additional medication...',
    modSend:'Send addition to pharmacy →',histTitle:'Delivery history',entrega:'Delivery',
    exportBtn:'↑ Export all to Google Sheets',exportCSV:'↓ Download CSV',syncOk:'Synced',syncOff:'Offline',
  }
};

const MEDS_DEFAULT = [
  {id:'m1',n:'Acetaminofén Susp',u:'frascos'},{id:'m2',n:'Acetaminofén Masticable',u:'tab'},
  {id:'m3',n:'Acetaminofén 500mg',u:'tab'},{id:'m4',n:'Ibuprofén 200mg',u:'tab'},
  {id:'m5',n:'Amoxicilina Susp 250mg',u:'frascos'},{id:'m6',n:'Amoxicilina 500mg',u:'tab'},
  {id:'m7',n:'Ciprofloxacina 500mg',u:'tab'},{id:'m8',n:'Metformina 850mg',u:'tab'},
  {id:'m9',n:'Omeprazol 20mg',u:'tab'},{id:'m10',n:'Loratadina 10mg',u:'tab'},
  {id:'m11',n:'ExFlu 120mL',u:'frascos'},{id:'m12',n:'ExFlu Infantil 30mL',u:'frascos'},
  {id:'m13',n:'Salbutamol Inhalador',u:'inhaladores'},
];
const UNITS = ['tab','frascos','inhaladores','sobres','cápsulas','ampollas','ml','g'];
const SYMS  = ['fie','dia','cab','art','tos'];
const SICO  = {fie:'🌡️',dia:'💧',cab:'🤕',art:'🦴',tos:'😮‍💨'};
const REFS  = ['OB/GYN','PED','DERM/PIEL','OJOS','DENTISTA','Médico Gral / Gen Med','Fisioterapia / PT'];
const DX_COLORS = ['#5b4fcf','#7c6fd8','#9d8fe1','#be9fea','#7c3f9e'];

// ── HELPERS ────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toLocaleDateString('es-GT');
const tnow     = () => new Date().toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit'});
const genId    = () => Math.random().toString(36).substr(2,5).toUpperCase();
const genMedId = () => 'mx_' + Math.random().toString(36).substr(2,6);

// ── STATE ─────────────────────────────────────────────────────────────────
// Load from localStorage or start fresh
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('elfaro_state') || '{}');
    return {
      lang: saved.lang || 'es',
      station: null, pinTarget: null, pinInput: '', pinError: false,
      setupDone: false,
      actLoc: saved.actLoc || '', actDate: saved.actDate || todayStr(),
      setupLocInput: '', setupDateInput: todayStr(),
      patients: saved.patients || [],
      meds: saved.meds || [...MEDS_DEFAULT],
      inventory: saved.inventory || Object.fromEntries(MEDS_DEFAULT.map(m => [m.id, 20])),
      initInventory: saved.initInventory || Object.fromEntries(MEDS_DEFAULT.map(m => [m.id, 20])),
      villages: saved.villages || ['San Lucas Tolimán','Cerro de Oro','San Antonio Palopó','Santa Catarina Palopó','Panabaj'],
      selPatient: null, docRx: {}, modRx: {}, modNote: '',
      adminTab: 'inv', stTab: 'nueva', newV: '',
      newMedName: '', newMedUnit: 'tab', newMedQty: 0, showNewMedForm: false,
      syncStatus: 'ok',
      inscF: {name:'',age:'',gender:'',phone:'',aldeaPaciente:'',pregnant:false,breastfeeding:false,
        bp:'',pulse:'',resp:'',weight:'',temp:'',referrals:[],
        symptoms:{fie:false,dia:false,cab:false,art:false,tos:false},conditions:{diabetes:false}},
      patView: 'main',
    };
  } catch(e) { return loadState.call({skip:true}); }
}

function saveState() {
  try {
    localStorage.setItem('elfaro_state', JSON.stringify({
      lang: S.lang, actLoc: S.actLoc, actDate: S.actDate,
      patients: S.patients, meds: S.meds,
      inventory: S.inventory, initInventory: S.initInventory,
      villages: S.villages,
    }));
  } catch(e) { console.warn('Could not save state', e); }
}

let S = loadState();
const L = () => T[S.lang];

// ── GOOGLE SHEETS SYNC ────────────────────────────────────────────────────
let syncQueue = [];
let syncing = false;

async function syncToSheets(type, data) {
  if (!SHEETS_URL || SHEETS_URL.includes('REEMPLAZA')) return;
  syncQueue.push({ type, data });
  if (!syncing) drainQueue();
}

async function drainQueue() {
  if (!syncQueue.length || syncing) return;
  syncing = true;
  while (syncQueue.length) {
    const item = syncQueue.shift();
    try {
      await fetch(SHEETS_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, data: item.data }),
      });
      updateSyncBar('ok');
    } catch(e) {
      updateSyncBar('offline');
      syncQueue.unshift(item); // retry later
      break;
    }
  }
  syncing = false;
}

function updateSyncBar(status) {
  S.syncStatus = status;
  const el = document.getElementById('sync-bar');
  if (!el) return;
  if (status === 'ok') {
    el.className = 'sync';
    el.textContent = `✓ ${L().syncOk} · ${S.actLoc} · ${S.actDate}`;
  } else {
    el.className = 'sync offline';
    el.textContent = `⚠ ${L().syncOff} · datos guardados localmente`;
  }
}

// Retry sync when connection returns
window.addEventListener('online', () => drainQueue());

// ── TOAST ─────────────────────────────────────────────────────────────────
let toastT = null;
function toast(msg) {
  const el = document.getElementById('tst');
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.style.display = 'none'; }, 2400);
}

// ── SET STATE & RENDER ────────────────────────────────────────────────────
function set(u) { Object.assign(S, u); saveState(); render(); }

// ── LOGO ──────────────────────────────────────────────────────────────────
let LOGO_B64 = '';
(function loadLogo() {
  const img = new Image();
  img.onload = function() {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    try { LOGO_B64 = c.toDataURL('image/jpeg', 0.85); render(); }
    catch(e) { render(); }
  };
  img.onerror = () => render();
  img.src = LOGO_PATH;
})();

// ── SERVICE WORKER ────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW error', e));
}

// ── TOGGLES ───────────────────────────────────────────────────────────────
function toggleSym(k)  { S.inscF.symptoms[k] = !S.inscF.symptoms[k]; render(); }
function toggleDiab()  { S.inscF.conditions.diabetes = !S.inscF.conditions.diabetes; render(); }
function toggleRef(r)  {
  S.inscF.referrals = S.inscF.referrals.includes(r)
    ? S.inscF.referrals.filter(x => x !== r) : [...S.inscF.referrals, r];
  render();
}

function setDocRx(medId, val) {
  S.docRx[medId] = Math.max(0, parseInt(val) || 0);
  updateStockCols('stock_');
}
function setModRx(medId, val) {
  S.modRx[medId] = Math.max(0, parseInt(val) || 0);
  updateStockCols('modstock_');
}
function updateStockCols(prefix) {
  S.meds.forEach(m => {
    const el = document.getElementById(prefix + m.id);
    if (!el) return;
    const cur = S.inventory[m.id] || 0;
    const qty = prefix === 'stock_' ? (S.docRx[m.id] || 0) : (S.modRx[m.id] || 0);
    const after = Math.max(0, cur - qty);
    let cls = 'stock-ok', icon = '';
    if (cur === 0) { cls = 'stock-zero'; icon = ' ✕'; }
    else if (cur < 5) { cls = 'stock-low'; icon = ' ⚠'; }
    el.innerHTML = `<div class="${cls}">${cur}${icon}</div>${qty > 0 ? `<div class="stock-after" style="color:${after < 3 ? 'var(--rd)' : 'var(--g6)'}">→ ${after}</div>` : ''}`;
  });
}

function toggleFarmItem(patId, medId) {
  S.patients = S.patients.map(p => {
    if (p.id !== patId) return p;
    const chk = p.deliveryChecked || [];
    return { ...p, deliveryChecked: chk.includes(medId) ? chk.filter(x => x !== medId) : [...chk, medId] };
  });
  set({ selPatient: { ...S.patients.find(x => x.id === patId) } });
}
function checkAllFarm(patId) {
  S.patients = S.patients.map(p => p.id !== patId ? p : { ...p, deliveryChecked: (p.prescription || []).map(rx => rx.medId) });
  set({ selPatient: { ...S.patients.find(x => x.id === patId) } });
}

function confirmDelivery(patId) {
  const p = S.patients.find(x => x.id === patId);
  if (!p) return;
  const checked = p.deliveryChecked || [];
  if (!checked.length) { toast('⚠ Marca al menos un medicamento'); return; }
  const deliveredMeds = (p.prescription || []).filter(rx => checked.includes(rx.medId)).map(rx => {
    const med = S.meds.find(m => m.id === rx.medId);
    return { name: rx.name, qty: rx.qty, u: med?.u || 'u' };
  });
  const newInv = { ...S.inventory };
  (p.prescription || []).forEach(rx => {
    if (checked.includes(rx.medId)) newInv[rx.medId] = Math.max(0, (newInv[rx.medId] || 0) - rx.qty);
  });
  S.inventory = newInv;
  const hist = [...(p.deliveryHistory || []), { at: tnow(), meds: deliveredMeds }];
  S.patients = S.patients.map(x => x.id === patId ? { ...x, status: 'delivered', deliveredAt: tnow(), deliveryChecked: checked, deliveryHistory: hist } : x);
  // Sync
  syncToSheets('dispensed', { patient: p, delivery: hist[hist.length - 1], deliveryNum: hist.length });
  syncToSheets('update_patient', S.patients.find(x => x.id === patId));
  syncToSheets('inventory_update', { meds: S.meds.map(m => ({ name: m.n, unit: m.u, initial: S.initInventory[m.id] || 0, current: S.inventory[m.id] || 0 })) });
  toast('✓ Entrega confirmada · Inventario actualizado');
  set({ selPatient: null });
}

function sendModification(patId) {
  const addedRx = Object.entries(S.modRx).filter(([, q]) => q > 0).map(([mid, qty]) => ({
    medId: mid, qty, name: S.meds.find(m => m.id === mid)?.n || mid
  }));
  if (!addedRx.length) { toast('⚠ Selecciona al menos un medicamento'); return; }
  const note = document.getElementById('mod-note')?.value || S.modNote || 'Modificación';
  S.patients = S.patients.map(p => {
    if (p.id !== patId) return p;
    const existingIds = (p.prescription || []).map(rx => rx.medId);
    const newItems = addedRx.filter(rx => !existingIds.includes(rx.medId));
    return { ...p, prescription: [...(p.prescription || []), ...newItems], deliveryChecked: [], status: 'prescribed', modNote: note, modifiedAt: tnow() };
  });
  S.modRx = {}; S.modNote = '';
  syncToSheets('update_patient', S.patients.find(x => x.id === patId));
  toast('✓ Modificación enviada a farmacia');
  set({ selPatient: null, patView: 'main' });
}

function addNewMed() {
  const name = (S.newMedName || '').trim();
  const unit = S.newMedUnit || 'tab';
  const qty  = Math.max(0, parseInt(S.newMedQty) || 0);
  if (!name) { toast('⚠ Nombre requerido'); return; }
  const id = genMedId();
  S.meds = [...S.meds, { id, n: name, u: unit }];
  S.inventory[id] = qty; S.initInventory[id] = qty;
  S.newMedName = ''; S.newMedUnit = 'tab'; S.newMedQty = 0; S.showNewMedForm = false;
  toast(`✓ ${name} agregado`);
  render();
}
function removeMed(medId) {
  if (S.patients.some(p => p.prescription?.some(rx => rx.medId === medId))) { toast('⚠ Ya fue recetado'); return; }
  S.meds = S.meds.filter(m => m.id !== medId);
  delete S.inventory[medId]; delete S.initInventory[medId];
  render();
}

function startSession() {
  const loc = document.getElementById('setup-loc-sel')?.value || '';
  const dt  = document.getElementById('setup-date-inp')?.value || todayStr();
  if (!loc) { toast('⚠ Selecciona la aldea de la jornada'); return; }
  S.actLoc = loc; S.actDate = dt; S.setupDone = true;
  saveState(); render();
}

function exportAllToSheets() {
  const inventoryData = S.meds.map(m => ({
    name: m.n, unit: m.u, initial: S.initInventory[m.id] || 0, current: S.inventory[m.id] || 0
  }));
  syncToSheets('export_all', { patients: S.patients, inventory: inventoryData });
  toast('✓ Enviando a Google Sheets...');
}

function exportCSV() {
  const rows = [['#','Nombre','Edad','Género','Teléfono','Aldea Paciente','Aldea Jornada','Fecha','BP','Pulso','Peso','Temp','Fiebre','Diarrea','Cabeza','Articular','Tos','Diabetes','Diagnóstico','Estado','Oración','Aceptó Cristo','Reconcilió','Contactar']];
  S.patients.forEach(p => {
    const sp = p.spiritual || {};
    rows.push([p.id,p.name,p.age,p.gender==='M'?'Masculino':'Femenino',p.phone||'',p.aldeaPaciente||'',p.location||'',p.date,p.bp||'',p.pulse||'',p.weight||'',p.temp||'',p.symptoms?.fie?'Sí':'',p.symptoms?.dia?'Sí':'',p.symptoms?.cab?'Sí':'',p.symptoms?.art?'Sí':'',p.symptoms?.tos?'Sí':'',p.conditions?.diabetes?'Sí':'',p.diagnosis||'',p.status,sp.prayed?'Sí':'',sp.accepted?'Sí':'',sp.reconciled?'Sí':'',sp.interested?'Sí':'']);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `elfaro_${S.actDate.replace(/\//g,'-')}.csv`; a.click();
  toast('✓ CSV descargado');
}

function getDxStats(pts) {
  const map = {};
  pts.forEach(p => {
    if (!p.diagnosis?.trim()) return;
    const k = p.diagnosis.trim().toLowerCase();
    if (!map[k]) map[k] = { label: p.diagnosis.trim(), count: 0 };
    map[k].count++;
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

// ── RENDER ────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!S.setupDone) { renderSetup(app); return; }
  if (!S.station)   { renderLogin(app); return; }

  const ico = { inscripcion:'📋', medico:'🩺', farmacia:'💊', espiritual:'✝️', admin:'⚙️' };
  const lbl = { inscripcion:L().ins, medico:L().med, farmacia:L().far, espiritual:L().esp, admin:L().adm };
  const logoHtml = LOGO_B64
    ? `<img src="${LOGO_B64}" class="hdr-logo" alt="El Faro"/>`
    : `<span style="font-weight:700;font-size:13px;color:var(--g9)">El Faro</span>`;

  app.innerHTML = `
    <div id="sync-bar" class="sync ${S.syncStatus === 'offline' ? 'offline' : ''}">
      ${S.syncStatus === 'offline' ? '⚠ ' + L().syncOff : '✓ ' + L().syncOk + ' · ' + S.actLoc + ' · ' + S.actDate}
    </div>
    <div class="hdr">
      ${logoHtml}
      <div class="hdr-sep"></div>
      <div class="hdr-info">
        <div class="hdr-station">${ico[S.station]} ${lbl[S.station]}</div>
        <div class="hdr-date">${S.actDate}</div>
      </div>
      <button class="exit-btn" onclick="set({station:null,selPatient:null,patView:'main'})">${L().exit}</button>
    </div>
    <div class="lbar"><div class="ltg">
      <button class="lt ${S.lang==='es'?'on':''}" onclick="set({lang:'es'})">ES</button>
      <button class="lt ${S.lang==='en'?'on':''}" onclick="set({lang:'en'})">EN</button>
    </div></div>
    <div class="con" id="con"></div>`;

  const con = document.getElementById('con');
  if      (S.station === 'inscripcion') con.innerHTML = renderInscripcion();
  else if (S.station === 'medico')      con.innerHTML = renderMedico();
  else if (S.station === 'farmacia')    con.innerHTML = renderFarmacia();
  else if (S.station === 'espiritual')  con.innerHTML = renderEspiritual();
  else                                  con.innerHTML = renderAdmin();
}

// ── All station render functions are in stations.js for clarity ───────────
// (For the single-file version, all functions are here)

function renderSetup(app) {
  const logoHtml = LOGO_B64 ? `<img src="${LOGO_B64}" class="login-logo" alt="El Faro"/>` : `<div style="font-weight:700;font-size:24px">El Faro</div>`;
  app.innerHTML = `
    <div class="login-hdr">
      ${logoHtml}
      <div style="font-size:12px;color:var(--g6)">${L().appSub}</div>
    </div>
    <div class="lbar"><div class="ltg">
      <button class="lt ${S.lang==='es'?'on':''}" onclick="set({lang:'es'})">ES</button>
      <button class="lt ${S.lang==='en'?'on':''}" onclick="set({lang:'en'})">EN</button>
    </div></div>
    <div class="con">
      <div style="font-size:13px;font-weight:600;margin-bottom:14px;text-align:center">⚙️ ${L().setupLoc}</div>
      <div class="setup-card">
        <div class="setup-label">📍 ${L().setupLoc}</div>
        <select id="setup-loc-sel" class="setup-select">
          <option value="">Selecciona / Select...</option>
          ${S.villages.map(v => `<option value="${v}">${v}</option>`).join('')}
        </select>
        <div style="font-size:10px;color:var(--g6);margin-top:6px">Aldea donde opera el equipo hoy / Team location today</div>
      </div>
      <div class="setup-card">
        <div class="setup-label">📅 ${L().setupDate}</div>
        <input type="date" id="setup-date-inp" class="setup-select" value="${S.setupDateInput}"/>
      </div>
      <button class="start-btn" onclick="startSession()">${L().setupBtn}</button>
    </div>`;
}

function renderLogin(app) {
  const logoHtml = LOGO_B64 ? `<img src="${LOGO_B64}" class="login-logo" alt="El Faro"/>` : `<div style="font-weight:700;font-size:24px">El Faro</div>`;
  let h = `
    <div class="login-hdr">
      ${logoHtml}
      <div style="font-size:12px;color:var(--g6)">${L().appSub}</div>
      <div style="font-size:10px;color:var(--tl);font-family:var(--mo)">📍 ${S.actLoc} · ${S.actDate}</div>
    </div>
    <div class="lbar"><div class="ltg">
      <button class="lt ${S.lang==='es'?'on':''}" onclick="set({lang:'es'})">ES</button>
      <button class="lt ${S.lang==='en'?'on':''}" onclick="set({lang:'en'})">EN</button>
    </div></div>
    <div class="con"><div class="pin-scr">`;
  if (!S.pinTarget) {
    h += `<div class="sg">
      <button class="sb t" onclick="set({pinTarget:'inscripcion',pinInput:'',pinError:false})"><div class="si">📋</div><div class="sn" style="color:var(--tl)">${L().ins}</div><div class="sd">${L().inD}</div></button>
      <button class="sb p" onclick="set({pinTarget:'medico',pinInput:'',pinError:false})"><div class="si">🩺</div><div class="sn" style="color:var(--pu)">${L().med}</div><div class="sd">${L().meD}</div></button>
      <button class="sb a" onclick="set({pinTarget:'farmacia',pinInput:'',pinError:false})"><div class="si">💊</div><div class="sn" style="color:var(--am)">${L().far}</div><div class="sd">${L().faD}</div></button>
      <button class="sb sp2" onclick="set({pinTarget:'espiritual',pinInput:'',pinError:false})"><div class="si">✝️</div><div class="sn" style="color:var(--sp)">${L().esp}</div><div class="sd">${L().esD}</div></button>
      <button class="sb g" style="grid-column:span 2" onclick="set({pinTarget:'admin',pinInput:'',pinError:false})"><div class="si">⚙️</div><div class="sn" style="color:var(--g6)">${L().adm}</div><div class="sd">${L().adD}</div></button>
    </div>
    <button onclick="set({setupDone:false})" style="font-size:10px;color:var(--g4);background:none;border:none;cursor:pointer;font-family:var(--fn)">⚙ Cambiar aldea / Change location</button>`;
  } else {
    h += `<div style="font-size:12px;color:var(--g6)">${L().pinFor}: <strong>${L()[S.pinTarget] || S.pinTarget}</strong></div>
    <div class="pdots">${[0,1,2,3].map(i => `<div class="pd ${S.pinInput.length>i?'f':''} ${S.pinError?'e':''}"></div>`).join('')}</div>
    ${S.pinError ? `<div style="color:var(--rd);font-size:12px;font-weight:500">${L().pinErr}</div>` : ''}
    <div class="kp">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k => k===''?`<div></div>`:`<button class="kk" onclick="pinKey('${k==='⌫'?'del':k}')">${k}</button>`).join('')}</div>
    <button onclick="set({pinTarget:null,pinInput:''})" style="font-size:12px;color:var(--g6);background:none;border:none;cursor:pointer;padding:6px;font-family:var(--fn)">← ${L().back}</button>`;
  }
  h += `</div></div>`;
  app.innerHTML = h;
}

function pinKey(k) {
  if (k === 'del') { set({ pinInput: S.pinInput.slice(0,-1) }); return; }
  const nx = S.pinInput + k;
  if (nx.length === 4) {
    if (nx === PINS[S.pinTarget]) set({ station: S.pinTarget, pinTarget: null, pinInput: '' });
    else { set({ pinInput: nx, pinError: true }); setTimeout(() => set({ pinInput: '', pinError: false }), 700); }
  } else set({ pinInput: nx });
}

// ── INSCRIPCIÓN ────────────────────────────────────────────────────────────
function renderInscripcion() {
  const f = S.inscF;
  const tod = S.patients.filter(p => p.date === S.actDate);
  let h = `<div class="tabs">
    <button class="tab ${S.stTab==='nueva'?'on':''}" onclick="set({stTab:'nueva'})">${L().nvo}</button>
    <button class="tab ${S.stTab==='lista'?'on':''}" onclick="set({stTab:'lista'})">${L().hoy} (${tod.length})</button>
  </div>`;
  if (S.stTab === 'nueva') {
    h += `<div class="stl">📋 Datos del paciente</div>
    <div class="fld"><label>${L().nom}</label><input value="${f.name}" oninput="S.inscF.name=this.value" placeholder="${L().nomPh}"/></div>
    <div class="r2">
      <div class="fld"><label>${L().edad}</label><input type="number" value="${f.age}" oninput="S.inscF.age=this.value" placeholder="${L().edPh}"/></div>
      <div class="fld"><label>${L().gen}</label><select onchange="S.inscF.gender=this.value;render()">
        <option value="">--</option><option value="M" ${f.gender==='M'?'selected':''}>${L().masc}</option><option value="F" ${f.gender==='F'?'selected':''}>${L().fem}</option>
      </select></div>
    </div>
    <div class="fld"><label>${L().tel}</label><input type="tel" value="${f.phone}" oninput="S.inscF.phone=this.value" placeholder="${L().telPh}"/></div>
    <div class="fld"><label>📍 ${L().aldea}</label>
      <div class="aldea-select-row"><span style="font-size:14px">🏘️</span>
        <select onchange="S.inscF.aldeaPaciente=this.value">
          <option value="">— Seleccionar —</option>
          ${S.villages.map(v => `<option value="${v}" ${f.aldeaPaciente===v?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    </div>
    ${f.gender==='F'?`<div class="r2" style="margin-bottom:10px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" ${f.pregnant?'checked':''} onchange="S.inscF.pregnant=this.checked"> ${L().emb}</label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" ${f.breastfeeding?'checked':''} onchange="S.inscF.breastfeeding=this.checked"> ${L().pec}</label>
    </div>`:''}
    <div class="hr"></div>
    <div class="stl">💓 ${L().vit}</div>
    <div class="r2">
      <div class="fld"><label>${L().bp}</label><input value="${f.bp}" oninput="S.inscF.bp=this.value" placeholder="120/80"/></div>
      <div class="fld"><label>${L().pls}</label><input value="${f.pulse}" oninput="S.inscF.pulse=this.value" placeholder="bpm"/></div>
    </div>
    <div class="r3">
      <div class="fld"><label>${L().res}</label><input value="${f.resp}" oninput="S.inscF.resp=this.value" placeholder="/min"/></div>
      <div class="fld"><label>${L().pes}</label><input value="${f.weight}" oninput="S.inscF.weight=this.value" placeholder="lbs"/></div>
      <div class="fld"><label>${L().tmp}</label><input value="${f.temp}" oninput="S.inscF.temp=this.value" placeholder="°F"/></div>
    </div>
    <div class="hr"></div>
    <div class="stl">🤒 ${L().sim} / Symptoms</div>
    <div class="sym-g">${SYMS.map(s => `<button type="button" class="sym-c ${f.symptoms[s]?'on':''}" onclick="toggleSym('${s}')"><span style="font-size:16px">${SICO[s]}</span><span>${L()[s]}</span></button>`).join('')}</div>
    <div class="stl">⚕️ ${L().cond} / Conditions</div>
    <button type="button" class="cond-c ${f.conditions.diabetes?'on':''}" onclick="toggleDiab()"><span style="font-size:16px">🩺</span><span>${L().diab}</span></button>
    <div class="hr"></div>
    <div class="stl">🔗 ${L().ref} / Referrals</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">${REFS.map(r => `<button type="button" class="rchip ${f.referrals.includes(r)?'on':''}" onclick="toggleRef('${r}')">${r}</button>`).join('')}</div>
    <button class="btn bt" onclick="submitPat()">${L().reg}</button>`;
  } else {
    if (!tod.length) h += `<div class="empty"><div style="font-size:32px;margin-bottom:10px">📋</div>${L().sinP}</div>`;
    else tod.forEach(p => {
      const sc = p.status==='waiting'?'sw':p.status==='attending'?'sa':p.status==='prescribed'?'spr':'sd2';
      const sl = {waiting:L().esp2,attending:L().ate,prescribed:L().rxst,delivered:L().ent}[p.status]||p.status;
      const sf = SYMS.filter(s => p.symptoms?.[s]).map(s => SICO[s]).join(' ');
      h += `<div class="card ct">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
          <span style="font-family:var(--mo);font-size:17px;font-weight:500;color:var(--tl)">#${p.id}</span>
          <span class="stbdg ${sc}">${sl}</span>
        </div>
        <div style="font-size:13px;font-weight:600">${p.name}</div>
        <div style="font-size:11px;color:var(--g6);margin-top:2px">${p.age}a · ${p.gender==='M'?L().masc:L().fem}${p.phone?' · 📞 '+p.phone:''}</div>
        <div style="font-size:11px;color:var(--tl);margin-top:2px">📍 ${p.aldeaPaciente||p.location||'—'}</div>
        ${sf?`<div style="font-size:11px;color:var(--g6);margin-top:3px">${sf}</div>`:''}
      </div>`;
    });
  }
  return h;
}

function submitPat() {
  const f = S.inscF;
  if (!f.name || !f.age) { toast('⚠ ' + L().nom); return; }
  const p = { ...f, symptoms:{...f.symptoms}, conditions:{...f.conditions}, referrals:[...f.referrals],
    id: genId(), status: 'waiting', createdAt: tnow(), date: S.actDate, location: S.actLoc,
    aldeaPaciente: f.aldeaPaciente || S.actLoc, deliveryChecked: [], deliveryHistory: [],
    spiritual: { prayed:false, accepted:false, reconciled:false, interested:false, notes:'' } };
  S.patients = [p, ...S.patients];
  S.inscF = { name:'',age:'',gender:'',phone:'',aldeaPaciente:'',pregnant:false,breastfeeding:false,
    bp:'',pulse:'',resp:'',weight:'',temp:'',referrals:[],
    symptoms:{fie:false,dia:false,cab:false,art:false,tos:false},conditions:{diabetes:false} };
  syncToSheets('new_patient', p);
  toast(`✓ #${p.id} registrado`);
  set({ stTab: 'lista' });
}

// ── MÉDICOS ────────────────────────────────────────────────────────────────
function renderMedico() {
  if (S.selPatient) {
    if (S.patView === 'modify') return renderModifyForm(S.selPatient);
    const p = S.selPatient;
    const actS = SYMS.filter(s => p.symptoms?.[s]);
    let h = `<button onclick="set({selPatient:null,patView:'main'})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:10px;font-family:var(--fn)">← ${L().vCola}</button>`;
    if (p.modifiedAt) h += `<div class="mod-banner"><span style="font-size:16px">✏️</span><div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--am)">Modificado ${p.modifiedAt}</div><div style="font-size:10px;color:var(--g6)">${p.modNote||''}</div></div><span class="mod-badge">${L().mod}</span></div>`;
    h += `<div class="card cp">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
        <span style="font-family:var(--mo);font-size:17px;font-weight:500;color:var(--tl)">#${p.id}</span>
        <span style="font-size:10px;color:var(--g6)">${p.createdAt}</span>
      </div>
      <div style="font-size:13px;font-weight:600">${p.name}</div>
      <div style="font-size:11px;color:var(--g6);margin-top:2px">${p.age}a · ${p.gender==='M'?L().masc:L().fem}${p.phone?' · 📞 '+p.phone:''}</div>
      <div style="font-size:11px;color:var(--tl);margin-top:1px">📍 ${p.aldeaPaciente||p.location||'—'}</div>
      ${p.referrals?.length?`<div style="font-size:10px;color:var(--g6);margin-top:2px">↗ ${p.referrals.join(', ')}</div>`:''}
      ${actS.length?`<div style="margin-top:7px;display:flex;flex-wrap:wrap;gap:5px">
        ${actS.map(s=>`<span style="background:var(--rdl);color:var(--rd);border-radius:20px;padding:2px 9px;font-size:10px;font-weight:500">${SICO[s]} ${L()[s]}</span>`).join('')}
        ${p.conditions?.diabetes?`<span style="background:var(--aml);color:var(--am);border-radius:20px;padding:2px 9px;font-size:10px;font-weight:500">🩺 ${L().diab}</span>`:''}
      </div>`:''}
    </div>`;
    if (p.deliveryHistory?.length) {
      h += `<div class="delivery-hist"><div class="delivery-hist-title">📦 ${L().histTitle}</div>
        ${p.deliveryHistory.map((d,i) => `<div style="margin-bottom:5px">
          <div style="font-size:10px;font-weight:600;color:var(--gn);margin-bottom:3px">${L().entrega} ${i+1} — ${d.at}</div>
          ${d.meds.map(m=>`<div class="dh-row"><span style="flex:1">${m.name}</span><span style="font-family:var(--mo);font-weight:600">${m.qty} ${m.u}</span></div>`).join('')}
        </div>`).join('')}</div>`;
    }
    if (p.bp) {
      h += `<div style="font-size:12px;font-weight:600;margin-bottom:9px">💓 ${L().vit}</div><div class="vg">
        ${p.bp?`<div class="vi"><div style="font-size:9px;color:var(--g6);text-transform:uppercase;margin-bottom:2px">${L().bp}</div><div style="font-size:14px;font-weight:600;font-family:var(--mo)">${p.bp}</div></div>`:''}
        ${p.pulse?`<div class="vi"><div style="font-size:9px;color:var(--g6);text-transform:uppercase;margin-bottom:2px">${L().pls}</div><div style="font-size:14px;font-weight:600;font-family:var(--mo)">${p.pulse} bpm</div></div>`:''}
        ${p.weight?`<div class="vi"><div style="font-size:9px;color:var(--g6);text-transform:uppercase;margin-bottom:2px">${L().pes}</div><div style="font-size:14px;font-weight:600;font-family:var(--mo)">${p.weight} lb</div></div>`:''}
        ${p.temp?`<div class="vi"><div style="font-size:9px;color:var(--g6);text-transform:uppercase;margin-bottom:2px">${L().tmp}</div><div style="font-size:14px;font-weight:600;font-family:var(--mo)">${p.temp}°F</div></div>`:''}
      </div>`;
    }
    if (p.status !== 'delivered' && p.status !== 'prescribed') {
      h += `<div class="fld"><label>${L().dx}</label><input id="dx" value="${p.diagnosis||''}" placeholder="${L().dxPh}"/></div>
      <div class="fld"><label>${L().not}</label><textarea id="dn" placeholder="${L().notPh}">${p.doctorNotes||''}</textarea></div>
      <div style="font-size:12px;font-weight:600;margin-bottom:9px">💊 ${L().rec}</div>
      <div style="background:var(--g1);border-radius:9px;overflow:hidden;margin-bottom:13px">
        <div style="display:flex;padding:6px 11px;border-bottom:1px solid var(--g2);font-size:9px;color:var(--g6);font-weight:600;text-transform:uppercase;letter-spacing:.04em">
          <span style="flex:1">Medicamento</span><span style="width:52px;text-align:center">Cant.</span><span style="width:54px;text-align:right">${L().stockLbl}</span>
        </div>
        ${S.meds.map(m => {
          const cur = S.inventory[m.id]||0, qty = S.docRx[m.id]||0, after = Math.max(0,cur-qty);
          let cls='stock-ok',icon='';
          if(cur===0){cls='stock-zero';icon=' ✕';}else if(cur<5){cls='stock-low';icon=' ⚠';}
          return `<div class="med-rx-row"><div class="med-rx-name">${m.n}</div>
            <div><input type="number" min="0" max="${cur}" value="${qty||''}" placeholder="0" oninput="setDocRx('${m.id}',this.value)" style="width:48px;padding:5px;border:1.5px solid var(--g2);border-radius:6px;font-size:12px;text-align:center;background:${qty>0?'#f0eeff':'var(--w)'}"/></div>
            <div class="med-rx-stock" id="stock_${m.id}"><div class="${cls}">${cur}${icon}</div>${qty>0?`<div class="stock-after" style="color:${after<3?'var(--rd)':'var(--g6)'}">→ ${after}</div>`:''}</div>
          </div>`;
        }).join('')}
      </div>
      <button class="btn bp" onclick="sendRx()">${L().envRx}</button>`;
    } else {
      if (p.diagnosis) h += `<div style="background:var(--pul);border-radius:9px;padding:10px 12px;margin-bottom:11px"><div style="font-size:10px;color:var(--pu);font-weight:600;margin-bottom:3px">${L().dx}</div><div style="font-size:12px;font-weight:500">${p.diagnosis}</div>${p.doctorNotes?`<div style="font-size:10px;color:var(--g6);margin-top:3px">${p.doctorNotes}</div>`:''}</div>`;
      if (p.prescription?.length) {
        h += `<div style="font-size:12px;font-weight:600;margin-bottom:9px">💊 ${L().rec}</div>
        <div style="background:var(--g1);border-radius:9px;padding:4px 11px;margin-bottom:13px">
          ${p.prescription.map(rx => { const med=S.meds.find(m=>m.id===rx.medId);return`<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--g2);font-size:11px"><span>${rx.name}</span><span style="font-family:var(--mo);font-weight:600;color:var(--tl)">${rx.qty} ${med?.u||'u'}</span></div>`;}).join('')}
        </div>`;
      }
      h += `<button type="button" onclick="set({patView:'modify',modRx:{}})" style="width:100%;padding:12px;border:1.5px dashed var(--am);border-radius:9px;background:var(--aml);color:var(--am);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fn)">${L().modBtn}</button>`;
    }
    return h;
  }
  const queue = S.patients.filter(p => p.status==='waiting'||p.status==='attending');
  const done  = S.patients.filter(p => p.status==='prescribed'||p.status==='delivered');
  let h = `<div class="stl">🟡 ${L().esp2} (${queue.length})</div>`;
  if (!queue.length) h += `<div class="empty"><div style="font-size:32px;margin-bottom:10px">✅</div>${L().sinC}</div>`;
  else queue.forEach(p => {
    const sf = SYMS.filter(s=>p.symptoms?.[s]).map(s=>SICO[s]).join('');
    h += `<div class="qi" onclick="selDoc('${p.id}')">
      <div class="qnum">#${p.id}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.name} ${sf}</div>
      <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.gender}${p.conditions?.diabetes?' · 🩺':''}</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div></div>
      <span class="stbdg ${p.status==='waiting'?'sw':'sa'}">${p.status==='waiting'?L().esp2:L().ate}</span>
    </div>`;
  });
  if (done.length) {
    h += `<div class="stl" style="margin-top:13px;color:var(--g6)">✅ ${L().ent} (${done.length})</div>`;
    done.forEach(p => {h += `<div class="qi" onclick="selDoc('${p.id}')" style="opacity:.7">
      <div class="qnum">#${p.id}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.name}${p.modifiedAt?' ✏️':''}</div>
      <div style="font-size:10px;color:var(--g6)">${p.diagnosis||'—'}</div>
      ${p.deliveryHistory?.length?`<div style="font-size:9px;color:var(--gn)">${p.deliveryHistory.length} entrega(s)</div>`:''}
      </div>
      <span class="stbdg ${p.status==='prescribed'?'spr':'sd2'}">${p.status==='prescribed'?L().rxst:'✓'}</span>
    </div>`;});
  }
  return h;
}

function renderModifyForm(p) {
  return `<button onclick="set({patView:'main'})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:10px;font-family:var(--fn)">← ${L().back}</button>
  <div style="background:var(--aml);border-radius:10px;padding:12px;margin-bottom:13px">
    <div style="font-size:12px;font-weight:600;color:var(--am);margin-bottom:4px">✏️ ${L().modTitle} — #${p.id}</div>
    <div style="font-size:12px;font-weight:500">${p.name}</div>
    <div style="font-size:10px;color:var(--g6)">${p.diagnosis||'—'}</div>
  </div>
  <div class="fld"><label>📝 ${L().modNote}</label><input id="mod-note" placeholder="${L().modNotePh}" value="${S.modNote||''}"/></div>
  <div style="font-size:12px;font-weight:600;margin-bottom:9px">💊 Medicamentos adicionales</div>
  <div style="background:var(--g1);border-radius:9px;overflow:hidden;margin-bottom:13px">
    <div style="display:flex;padding:6px 11px;border-bottom:1px solid var(--g2);font-size:9px;color:var(--g6);font-weight:600;text-transform:uppercase;letter-spacing:.04em">
      <span style="flex:1">Medicamento</span><span style="width:52px;text-align:center">Cant.</span><span style="width:54px;text-align:right">${L().stockLbl}</span>
    </div>
    ${S.meds.map(m => {
      const cur = S.inventory[m.id]||0, qty = S.modRx[m.id]||0, after = Math.max(0,cur-qty);
      const alreadyRx = (p.prescription||[]).find(rx=>rx.medId===m.id);
      let cls='stock-ok',icon='';
      if(cur===0){cls='stock-zero';icon=' ✕';}else if(cur<5){cls='stock-low';icon=' ⚠';}
      return `<div class="med-rx-row" style="background:${alreadyRx?'#f8f7f5':''}">
        <div class="med-rx-name">${m.n}${alreadyRx?`<span style="font-size:9px;color:var(--g4);margin-left:4px">ya recetado</span>`:''}</div>
        <div><input type="number" min="0" max="${cur}" value="${qty||''}" placeholder="0" oninput="setModRx('${m.id}',this.value)" style="width:48px;padding:5px;border:1.5px solid var(--g2);border-radius:6px;font-size:12px;text-align:center;background:${qty>0?'#fff8e6':'var(--w)'}"/></div>
        <div class="med-rx-stock" id="modstock_${m.id}"><div class="${cls}">${cur}${icon}</div>${qty>0?`<div class="stock-after" style="color:${after<3?'var(--rd)':'var(--g6)'}">→ ${after}</div>`:''}</div>
      </div>`;
    }).join('')}
  </div>
  <button class="btn ba2" onclick="sendModification('${p.id}')">${L().modSend}</button>`;
}

function selDoc(id) {
  const p = S.patients.find(x => x.id === id);
  S.docRx = Object.fromEntries((p.prescription||[]).map(r => [r.medId, r.qty]));
  S.patients = S.patients.map(x => x.id===id ? {...x,status:x.status==='waiting'?'attending':x.status} : x);
  set({ selPatient: {...p}, patView: 'main' });
}
function sendRx() {
  const dx = document.getElementById('dx')?.value;
  const dn = document.getElementById('dn')?.value;
  if (!dx) { toast('⚠ ' + L().dx); return; }
  const rx = Object.entries(S.docRx).filter(([,q])=>q>0).map(([mid,qty])=>({medId:mid,qty,name:S.meds.find(m=>m.id===mid)?.n}));
  const id = S.selPatient.id;
  S.patients = S.patients.map(p => p.id===id ? {...p,status:'prescribed',diagnosis:dx,doctorNotes:dn,prescription:rx,prescribedAt:tnow(),deliveryChecked:[]} : p);
  syncToSheets('update_patient', S.patients.find(x=>x.id===id));
  toast('✓ Receta enviada');
  set({ selPatient: null, patView: 'main' }); S.docRx = {};
}

// ── FARMACIA ────────────────────────────────────────────────────────────────
function renderFarmacia() {
  if (S.selPatient) {
    const p = S.selPatient;
    const checked = p.deliveryChecked || [];
    const allIds = (p.prescription||[]).map(rx=>rx.medId);
    const allChk = allIds.length>0 && allIds.every(id=>checked.includes(id));
    let h = `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:10px;font-family:var(--fn)">← ${L().back}</button>`;
    if (p.modifiedAt) h += `<div class="mod-banner"><span style="font-size:16px">✏️</span><div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--am)">Modificación ${p.modifiedAt}</div><div style="font-size:10px;color:var(--g6)">${p.modNote||''}</div></div><span class="mod-badge">${L().mod}</span></div>`;
    h += `<div class="card ca">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">
        <span style="font-family:var(--mo);font-size:17px;font-weight:500;color:var(--tl)">#${p.id}</span>
        <span style="font-size:10px;color:var(--g6)">${p.prescribedAt||''}</span>
      </div>
      <div style="font-size:13px;font-weight:600">${p.name}</div>
      <div style="font-size:11px;color:var(--tl);margin-top:1px">📍 ${p.aldeaPaciente||'—'}</div>
      ${p.diagnosis?`<div style="margin-top:5px;font-size:11px;color:var(--pu);font-weight:500">Dx: ${p.diagnosis}</div>`:''}
    </div>`;
    if (p.deliveryHistory?.length) {
      h += `<div class="delivery-hist"><div class="delivery-hist-title">📦 ${L().histTitle}</div>
        ${p.deliveryHistory.map((d,i)=>`<div style="margin-bottom:4px"><div style="font-size:10px;font-weight:600;color:var(--gn);margin-bottom:2px">${L().entrega} ${i+1} — ${d.at}</div>
        ${d.meds.map(m=>`<div class="dh-row"><span style="flex:1">${m.name}</span><span style="font-family:var(--mo);font-weight:600">${m.qty} ${m.u}</span></div>`).join('')}</div>`).join('')}
      </div>`;
    }
    if (!p.prescription?.length) { h += `<div style="font-size:11px;color:var(--g6);padding:8px 0">Sin medicamentos</div>`; }
    else {
      h += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px">
        <div style="font-size:12px;font-weight:600">💊 ${L().rec} — ${checked.length}/${allIds.length}</div>
        ${!allChk?`<button type="button" onclick="checkAllFarm('${p.id}')" style="font-size:10px;padding:4px 11px;border-radius:20px;background:var(--tll);color:var(--tl);border:1px solid var(--tl);cursor:pointer;font-family:var(--fn);font-weight:500">${L().chkAll}</button>`:''}
      </div>`;
      p.prescription.forEach(rx => {
        const isChk = checked.includes(rx.medId);
        const stock = S.inventory[rx.medId]||0, after = Math.max(0,stock-rx.qty);
        const med = S.meds.find(m=>m.id===rx.medId);
        h += `<div class="farm-item ${isChk?'checked':''}" onclick="toggleFarmItem('${p.id}','${rx.medId}')">
          <div class="farm-chk ${isChk?'checked':''}">${isChk?'✓':''}</div>
          <div class="farm-item-info">
            <div class="farm-item-name">${rx.name}</div>
            <div class="farm-item-qty">${rx.qty} ${med?.u||'u'} · ${isChk?`<span style="color:var(--gn);font-weight:500">Entregado ✓</span>`:`<span style="color:var(--g6)">Pendiente</span>`}</div>
          </div>
          <div style="font-size:10px;font-family:var(--mo);text-align:right;min-width:44px">
            <div style="font-weight:600;color:${stock<5?'var(--rd)':'var(--g9)'}">${stock}</div>
            <div style="font-size:9px;color:${after<3?'var(--rd)':'var(--g6)'}">→ ${after}</div>
          </div>
        </div>`;
      });
      if (checked.length>0) h += `<div style="background:var(--gnl);border-radius:9px;padding:9px 11px;margin-bottom:12px;font-size:11px;color:var(--gn);font-weight:500">
        📦 ${L().stockAfter}: ${p.prescription.filter(rx=>checked.includes(rx.medId)).map(rx=>`${rx.name.split(' ').pop()}: ${Math.max(0,(S.inventory[rx.medId]||0)-rx.qty)}`).join(' · ')}
      </div>`;
    }
    if (p.doctorNotes) h += `<div style="font-size:11px;color:var(--g6);background:var(--g1);border-radius:8px;padding:10px;margin:9px 0">${p.doctorNotes}</div>`;
    const canCfm = checked.length>0 && p.status!=='delivered';
    h += `<button class="btn ${canCfm?'btn-gn':'bg'}" onclick="${canCfm?`confirmDelivery('${p.id}')`:''}" style="opacity:${canCfm?1:0.5};cursor:${canCfm?'pointer':'default'}">${L().cfm}</button>`;
    return h;
  }
  const pend  = S.patients.filter(p => p.status==='prescribed');
  const deliv = S.patients.filter(p => p.status==='delivered');
  let h = `<div class="stl">🟠 ${L().pend} (${pend.length})</div>`;
  if (!pend.length) h += `<div class="empty"><div style="font-size:32px;margin-bottom:10px">💊</div>${L().sinPe}</div>`;
  else pend.forEach(p => {
    const chk=(p.deliveryChecked||[]).length, tot=(p.prescription||[]).length;
    h += `<div class="qi" onclick="set({selPatient:{...S.patients.find(x=>x.id==='${p.id}')}})">
      <div class="qnum">#${p.id}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.name}${p.modifiedAt?' ✏️':''}</div>
      <div style="font-size:10px;color:var(--g6)">${p.diagnosis||''} · ${tot} med · ${chk}/${tot} ✓</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div></div>
      <span class="stbdg spr">→</span>
    </div>`;
  });
  const modMeds = S.meds.filter(m=>(S.inventory[m.id]||0)<(S.initInventory[m.id]||0));
  if (modMeds.length) {
    h += `<div style="background:var(--g1);border-radius:10px;padding:11px 13px;margin-top:14px;margin-bottom:11px">
      <div style="font-size:11px;font-weight:600;margin-bottom:8px;color:var(--g6)">📦 Balance actual</div>
      ${modMeds.map(m=>{const cur=S.inventory[m.id]||0,init=S.initInventory[m.id]||1,pct=Math.round(cur/init*100);
        return`<div style="display:flex;align-items:center;gap:7px;padding:5px 0;border-bottom:1px solid var(--g2);font-size:10px">
          <div style="flex:1;color:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g9)'}">${m.n}${cur===0?' ✕':cur<5?' ⚠':''}</div>
          <div style="width:52px;height:6px;background:var(--g2);border-radius:3px;overflow:hidden"><div style="height:100%;border-radius:3px;width:${pct}%;background:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--gn)'}"></div></div>
          <div style="font-family:var(--mo);font-weight:600;min-width:20px;text-align:right;color:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g9)'}">${cur}</div>
        </div>`;}).join('')}
    </div>`;
  }
  if (deliv.length) {
    h += `<div class="stl" style="margin-top:6px;color:var(--g6)">✅ ${L().ents} (${deliv.length})</div>`;
    deliv.forEach(p => {h += `<div class="qi" style="opacity:.7">
      <div class="qnum">#${p.id}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.name}</div>
      <div style="font-size:10px;color:var(--g6)">${p.deliveryHistory?.length||0} entrega(s) · ${p.deliveredAt||''}</div></div>
      <span class="stbdg sd2">✓</span>
    </div>`;});
  }
  return h;
}

// ── ESPIRITUAL ─────────────────────────────────────────────────────────────
function renderEspiritual() {
  if (S.selPatient) {
    const p = S.selPatient, sp = p.spiritual || {};
    const items = [{k:'prayed',i:'🙏',l:L().pr,s:L().prPh},{k:'accepted',i:'✝️',l:L().cr,s:L().crPh},{k:'reconciled',i:'🕊️',l:L().rc,s:L().rcPh},{k:'interested',i:'📞',l:L().ct,s:L().ctPh}];
    return `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:10px;font-family:var(--fn)">← ${L().back}</button>
    <div class="card csp"><div style="margin-bottom:7px"><span style="font-family:var(--mo);font-size:17px;font-weight:500;color:var(--tl)">#${p.id}</span></div>
    <div style="font-size:13px;font-weight:600">${p.name}</div>
    <div style="font-size:11px;color:var(--tl);margin-top:1px">📍 ${p.aldeaPaciente||p.location||'—'}</div></div>
    <div style="margin-bottom:13px">${items.map(it=>`<button type="button" class="schk ${sp[it.k]?'on':''}" onclick="togSpirit('${p.id}','${it.k}')">
      <span style="font-size:17px">${sp[it.k]?'☑':'☐'}</span>
      <div><div style="font-size:12px">${it.i} ${it.l}</div><div style="font-size:10px;color:var(--g6);margin-top:1px">${it.s}</div></div>
    </button>`).join('')}</div>
    <div class="fld"><label>📝 ${L().nEsp}</label><textarea placeholder="..." oninput="updSN('${p.id}',this.value)">${sp.notes||''}</textarea></div>
    <button class="btn bsp" onclick="saveSpiritual('${p.id}')">${L().gEsp}</button>`;
  }
  let h = `<div class="stl">✝️ ${L().esp}</div>`;
  if (!S.patients.length) h += `<div class="empty"><div style="font-size:32px;margin-bottom:10px">✝️</div>${L().sinP}</div>`;
  else S.patients.forEach(p => {
    const sp = p.spiritual || {};
    const fl = [sp.prayed?'🙏':'',sp.accepted?'✝️':'',sp.reconciled?'🕊️':'',sp.interested?'📞':''].filter(Boolean).join(' ');
    h += `<div class="qi" onclick="set({selPatient:{...S.patients.find(x=>x.id==='${p.id}')}})">
      <div class="qnum">#${p.id}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.name}</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'} ${fl||''}</div></div>
      <span style="font-size:16px">${fl?'✅':'○'}</span>
    </div>`;
  });
  return h;
}
function togSpirit(pid,key){S.patients=S.patients.map(p=>{if(p.id!==pid)return p;const sp={...p.spiritual};sp[key]=!sp[key];return{...p,spiritual:sp};});set({selPatient:{...S.patients.find(x=>x.id===pid)}});}
function updSN(pid,v){S.patients=S.patients.map(p=>p.id!==pid?p:{...p,spiritual:{...p.spiritual,notes:v}});}
function saveSpiritual(pid){
  const p=S.patients.find(x=>x.id===pid);
  syncToSheets('spiritual_update',p);
  toast('✓ '+L().gEsp);set({selPatient:null});
}

// ── ADMIN ──────────────────────────────────────────────────────────────────
function renderAdmin() {
  const tab = S.adminTab;
  let h = `<div class="tabs">
    <button class="tab ${tab==='inv'?'on':''}" onclick="set({adminTab:'inv'})">📦 Inv.</button>
    <button class="tab ${tab==='stats'?'on':''}" onclick="set({adminTab:'stats'})">📊 Stats</button>
    <button class="tab ${tab==='ald'?'on':''}" onclick="set({adminTab:'ald'})">📍 Aldeas</button>
    <button class="tab ${tab==='export'?'on':''}" onclick="set({adminTab:'export'})">↑ Sync</button>
  </div>`;
  if      (tab === 'inv')    h += renderInv();
  else if (tab === 'stats')  h += renderStats();
  else if (tab === 'ald')    h += renderAldeas();
  else                       h += renderExport();
  return h;
}

function renderInv() {
  let h = `<div class="stl">📦 ${L().inv}</div>
  <div style="background:var(--g1);border-radius:9px;padding:4px 0 4px 9px;margin-bottom:11px">
    ${S.meds.map(m => {
      const cur=S.inventory[m.id]||0, init=S.initInventory[m.id]||0, used=init-cur, isCustom=m.id.startsWith('mx_');
      return `<div class="inv-r">
        <div style="flex:1"><div style="font-size:11px">${m.n}<span style="font-size:9px;color:var(--g4);margin-left:4px">(${m.u})</span>${isCustom?` <span style="font-size:9px;color:var(--tl)">★</span>`:''}</div>
        ${used>0?`<div style="font-size:9px;color:var(--am)">−${used} entregados</div>`:''}</div>
        <div style="display:flex;align-items:center;gap:5px">
          <button type="button" onclick="S.inventory['${m.id}']=Math.max(0,(S.inventory['${m.id}']||0)-1);render()" style="width:24px;height:24px;border:1.5px solid var(--g2);border-radius:6px;background:var(--w);font-size:15px;cursor:pointer;color:var(--g6)">−</button>
          <input type="number" value="${cur}" oninput="S.inventory['${m.id}']=Math.max(0,parseInt(this.value)||0)" style="width:44px;padding:4px;border:1.5px solid ${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g2)'};border-radius:6px;font-size:13px;text-align:center;font-family:var(--mo);color:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g9)'}"/>
          <button type="button" onclick="S.inventory['${m.id}']=(S.inventory['${m.id}']||0)+1;render()" style="width:24px;height:24px;border:1.5px solid var(--g2);border-radius:6px;background:var(--w);font-size:15px;cursor:pointer;color:var(--g6)">+</button>
          ${isCustom?`<button type="button" onclick="removeMed('${m.id}')" style="width:24px;height:24px;border:none;background:none;font-size:15px;cursor:pointer;color:var(--g4)">✕</button>`:''}
        </div>
      </div>`;
    }).join('')}
  </div>
  ${S.showNewMedForm ? `
  <div class="new-med-form">
    <div style="font-size:11px;font-weight:600;color:var(--tl);margin-bottom:10px">➕ ${L().newMed}</div>
    <div class="fld" style="margin-bottom:8px"><label>${L().newMedNom}</label><input value="${S.newMedName}" oninput="S.newMedName=this.value" placeholder="Ej: Amoxicilina 875mg"/></div>
    <div class="r2" style="margin-bottom:8px">
      <div class="fld" style="margin-bottom:0"><label>${L().newMedUnit}</label><select onchange="S.newMedUnit=this.value">${UNITS.map(u=>`<option value="${u}" ${S.newMedUnit===u?'selected':''}>${u}</option>`).join('')}</select></div>
      <div class="fld" style="margin-bottom:0"><label>${L().newMedQty}</label><input type="number" value="${S.newMedQty||''}" oninput="S.newMedQty=parseInt(this.value)||0" placeholder="0"/></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn bt btn-sm" onclick="addNewMed()" style="flex:1">✓ Agregar</button>
      <button class="btn bg btn-sm" onclick="set({showNewMedForm:false})" style="flex:1">Cancelar</button>
    </div>
  </div>` : `
  <button type="button" onclick="set({showNewMedForm:true})" style="width:100%;padding:11px;border:1.5px dashed var(--tl);border-radius:9px;background:var(--tll);color:var(--tl);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fn)">➕ ${L().newMed}</button>`}`;
  return h;
}

function renderStats() {
  const pts=S.patients, total=pts.length;
  if(!total) return `<div class="empty"><div style="font-size:32px;margin-bottom:10px">📊</div>${L().sinP}</div>`;
  const males=pts.filter(p=>p.gender==='M').length, females=pts.filter(p=>p.gender==='F').length;
  const deliv=pts.filter(p=>p.status==='delivered').length, wait=pts.filter(p=>p.status==='waiting'||p.status==='attending').length, presc=pts.filter(p=>p.status==='prescribed').length;
  const agG=[{l:L().a0,mn:0,mx:12},{l:L().a1,mn:13,mx:17},{l:L().a2,mn:18,mx:35},{l:L().a3,mn:36,mx:59},{l:L().a4,mn:60,mx:200}];
  const agC=agG.map(g=>({l:g.l,c:pts.filter(p=>{const a=parseInt(p.age)||0;return a>=g.mn&&a<=g.mx;}).length}));
  const symD=SYMS.map(s=>({k:s,l:L()[s],i:SICO[s],c:pts.filter(p=>p.symptoms?.[s]).length})).sort((a,b)=>b.c-a.c);
  const dibC=pts.filter(p=>p.conditions?.diabetes).length, mxS=Math.max(1,...symD.map(s=>s.c),dibC);
  const dxStats=getDxStats(pts), dxTotal=dxStats.reduce((s,d)=>s+d.count,0), maxDx=dxStats.length?dxStats[0].count:1;
  const sp_p=pts.filter(p=>p.spiritual?.prayed).length, sp_a=pts.filter(p=>p.spiritual?.accepted).length, sp_r=pts.filter(p=>p.spiritual?.reconciled).length, sp_i=pts.filter(p=>p.spiritual?.interested).length;
  const medT={};pts.forEach(p=>{(p.deliveryHistory||[]).forEach(d=>d.meds.forEach(m=>{medT[m.name]=(medT[m.name]||0)+m.qty;}));});
  const topM=Object.entries(medT).map(([n,q])=>({n,q})).sort((a,b)=>b.q-a.q);
  const mxM=Math.max(1,...topM.map(m=>m.q)), totM=topM.reduce((s,m)=>s+m.q,0);
  const villages=[...new Set(pts.map(p=>p.aldeaPaciente||p.location||'—'))];
  const mxV=Math.max(1,...villages.map(v=>pts.filter(p=>(p.aldeaPaciente||p.location)===v).length));
  const cols=['#0d7a5f','#5b4fcf','#c47f17','#c0392b','#1a6fa8'];
  const Bar=(lbl,cnt,mx,col)=>`<div class="br"><div style="font-size:10px;color:var(--g6);min-width:90px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${lbl}</div><div class="btr"><div class="bf2" style="width:${mx?Math.round(cnt/mx*100):0}%;background:${col}"></div></div><div style="font-size:10px;font-weight:600;min-width:22px;text-align:right;font-family:var(--mo)">${cnt}</div></div>`;
  return `
  <div class="sbox"><div class="sbox-title">👥 ${L().tP}</div>
    <div class="sgrid">${[{l:L().tP,v:total,c:'var(--tl)'},{l:L().ents,v:deliv,c:'var(--gn)'},{l:L().esp2,v:wait,c:'#e65100'},{l:L().rxst,v:presc,c:'var(--pu)'}].map(s=>`<div class="sc"><div style="font-size:9px;color:var(--g6);margin-bottom:2px">${s.l}</div><div style="font-size:20px;font-weight:600;font-family:var(--mo);color:${s.c}">${s.v}</div></div>`).join('')}</div>
    <div style="font-size:11px;font-weight:600;margin-bottom:8px;margin-top:4px">⚥ Por género</div>
    <div style="display:flex;gap:9px;margin-bottom:12px">${[{l:L().masc,c:males,col:'#1a6fa8'},{l:L().fem,c:females,col:'#c47f17'}].map(g=>`<div style="flex:1;background:var(--w);border-radius:8px;padding:9px 11px;text-align:center;border:1px solid var(--g2)"><div style="font-size:9px;color:var(--g6);margin-bottom:2px">${g.l}</div><div style="font-size:21px;font-weight:600;font-family:var(--mo);color:${g.col}">${g.c}</div><div style="font-size:9px;color:var(--g6)">${total?Math.round(g.c/total*100):0}%</div></div>`).join('')}</div>
    <div style="font-size:11px;font-weight:600;margin-bottom:8px">🎂 Por edad</div>
    ${agC.map((g,i)=>Bar(g.l,g.c,Math.max(1,total),cols[i%cols.length])).join('')}
    ${villages.length>1?`<div style="font-size:11px;font-weight:600;margin-bottom:8px;margin-top:10px">📍 Por aldea</div>${villages.map((v,i)=>Bar(v,pts.filter(p=>(p.aldeaPaciente||p.location)===v).length,mxV,cols[i%cols.length])).join('')}`:''}
  </div>
  <div class="sbox"><div class="sbox-title">🩺 ${L().dxTitle}</div>
    ${!dxStats.length?`<div style="font-size:11px;color:var(--g6);font-style:italic">${L().dxNone}</div>`:dxStats.map((dx,i)=>`<div class="dx-row">
      <div class="dx-rank">${i+1}</div><div class="dx-label" title="${dx.label}">${dx.label}</div>
      <div style="width:62px;flex-shrink:0"><div style="height:8px;background:var(--g2);border-radius:4px;overflow:hidden"><div style="height:100%;border-radius:4px;width:${Math.round(dx.count/maxDx*100)}%;background:${DX_COLORS[i%DX_COLORS.length]}"></div></div></div>
      <div style="min-width:34px;text-align:right"><div class="dx-count">${dx.count}</div><div class="dx-pct">${dxTotal?Math.round(dx.count/dxTotal*100):0}%</div></div>
    </div>`).join('')}
    ${dxStats.length?`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--g2);display:flex;justify-content:space-between;font-size:10px;color:var(--g6)"><span>${dxStats.length} distintos</span><span>${dxTotal} con Dx</span></div>`:''}
  </div>
  <div class="sbox"><div class="sbox-title">🤒 Síntomas</div>
    ${symD.map(s=>Bar(`${s.i} ${s.l}`,s.c,mxS,'var(--rd)')).join('')}${dibC>0?Bar('🩺 '+L().diab,dibC,mxS,'var(--am)'):''}
  </div>
  <div class="sbox"><div class="sbox-title">✝️ Clínica Espiritual</div>
    ${[{i:'🙏',l:L().pr,v:sp_p},{i:'✝️',l:L().cr,v:sp_a},{i:'🕊️',l:L().rc,v:sp_r},{i:'📞',l:L().ct,v:sp_i}].map(it=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--g2);font-size:11px"><span>${it.i} ${it.l}</span><span style="font-family:var(--mo);font-size:17px;font-weight:600;color:var(--sp)">${it.v}</span></div>`).join('')}
  </div>
  <div class="sbox"><div class="sbox-title">💊 Farmacia</div>
    <div style="display:flex;gap:9px;margin-bottom:11px">${[{l:L().ents,v:deliv,c:'var(--am)'},{l:'Unidades',v:totM,c:'var(--am)'}].map(s=>`<div style="flex:1;background:var(--w);border-radius:8px;padding:9px 11px;text-align:center;border:1px solid var(--g2)"><div style="font-size:9px;color:var(--g6);margin-bottom:2px">${s.l}</div><div style="font-size:21px;font-weight:600;font-family:var(--mo);color:${s.c}">${s.v}</div></div>`).join('')}</div>
    ${topM.length?topM.map(m=>Bar(m.n,m.q,mxM,'var(--am)')).join(''):`<div style="font-size:11px;color:var(--g6)">${L().sinMed}</div>`}
  </div>`;
}

function renderAldeas() {
  return `<div class="stl">📍 ${L().alds}</div>
  <div style="font-size:10px;color:var(--g6);margin-bottom:9px">Jornada actual: <strong style="color:var(--tl)">${S.actLoc}</strong></div>
  <div style="margin-bottom:10px">${S.villages.map((v,i)=>`<div class="ald-i"><span style="flex:1">${v}${v===S.actLoc?' ✓':''}</span><button type="button" onclick="S.villages=S.villages.filter((_,j)=>j!==${i});render()" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:15px;padding:2px 5px">✕</button></div>`).join('')}</div>
  <div style="display:flex;gap:7px">
    <input id="nald" value="${S.newV||''}" placeholder="${L().addAPh}" oninput="S.newV=this.value" style="flex:1;padding:9px 11px;border:1.5px solid var(--g2);border-radius:8px;font-size:12px;font-family:var(--fn)"/>
    <button type="button" onclick="var v=(S.newV||'').trim();if(!v)return;if(!S.villages.includes(v))S.villages=[...S.villages,v];S.newV='';toast('✓ '+v);render()" style="padding:9px 13px;border-radius:8px;background:var(--tl);color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fn)">${L().agr}</button>
  </div>`;
}

function renderExport() {
  const isConfigured = SHEETS_URL && !SHEETS_URL.includes('REEMPLAZA');
  return `<div class="stl">↑ ${L().exportBtn.split(' ')[0]} / Export</div>
  <div style="background:var(--g1);border-radius:10px;padding:13px;margin-bottom:12px;font-size:12px;color:var(--g6)">
    <strong style="color:var(--g9)">${S.patients.length}</strong> pacientes · <strong style="color:var(--g9)">${S.actLoc}</strong> · ${S.actDate}
  </div>
  ${!isConfigured?`<div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:9px;padding:12px;margin-bottom:12px;font-size:11px;color:#e65100">⚠️ Google Sheets no está configurado. Sigue las instrucciones en el archivo <strong>INSTRUCCIONES.md</strong> para conectarlo. Mientras tanto puedes descargar CSV.</div>`:''}
  <div style="display:flex;flex-direction:column;gap:8px">
    <button class="btn bt" onclick="exportAllToSheets()" style="opacity:${isConfigured?1:0.4}" ${!isConfigured?'disabled':''}>📊 ${L().exportBtn}</button>
    <button class="btn bg" onclick="exportCSV()">📥 ${L().exportCSV} — Pacientes</button>
    <button class="btn bg" onclick="exportSpiritCSV()">📥 ${L().exportCSV} — Espiritual</button>
    <button class="btn bg" onclick="exportPharmacyCSV()">📥 ${L().exportCSV} — Farmacia</button>
  </div>`;
}

function exportSpiritCSV() {
  const rows = [['#','Nombre','Teléfono','Aldea','Fecha','Oración','Aceptó Cristo','Reconcilió','Contactar','Notas']];
  S.patients.forEach(p => {
    const sp = p.spiritual || {};
    rows.push([p.id,p.name,p.phone||'',p.aldeaPaciente||'',p.date,sp.prayed?'Sí':'',sp.accepted?'Sí':'',sp.reconciled?'Sí':'',sp.interested?'Sí':'',sp.notes||'']);
  });
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`elfaro_espiritual_${S.actDate.replace(/\//g,'-')}.csv`; a.click();
  toast('✓ CSV espiritual descargado');
}

function exportPharmacyCSV() {
  const rows = [['Medicamento','Unidad','Stock Inicial','Stock Actual','Consumido']];
  S.meds.forEach(m => rows.push([m.n,m.u,S.initInventory[m.id]||0,S.inventory[m.id]||0,(S.initInventory[m.id]||0)-(S.inventory[m.id]||0)]));
  const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`elfaro_farmacia_${S.actDate.replace(/\//g,'-')}.csv`; a.click();
  toast('✓ CSV farmacia descargado');
}

// ── START ─────────────────────────────────────────────────────────────────
render();
