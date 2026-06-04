// ============================================================
// EL FARO — app.js  v11.10
// ⚠ CONFIGURACIÓN:
//   1. Edita firebase-config.js con tus claves de Firebase
//   2. Renombra tu logo a logo-faro.jpg
//   3. Edita SHEETS_URL con tu URL de Google Apps Script
// ============================================================

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz6EjnmR6zaGbDBR4Zbv-XDJ1q9fkCZ3VSmfNQV7Lp-jVyFJZD0gJp7XLEG5t6wiHct/exec';
const LOGO_PATH  = 'logo-faro.jpg';

// ── PINS ──────────────────────────────────────────────────────────────────
const PINS = {
  inscripcion:'1111', vitales:'1112', medico:'2222',
  dental:'2223', ojos:'2224', especialidad:'2225',
  farmacia:'3333', espiritual:'4444', admin:'9999'
};

// ── AREAS ────────────────────────────────────────────────────────────────
const AREAS = [
  {id:'doctor',   label:'Doctor / Médico',     icon:'🩺', cls:'area-doctor',  desc:'Consulta médica general'},
  {id:'dental',   label:'Dental',              icon:'🦷', cls:'area-dental',  desc:'Atención odontológica'},
  {id:'ojos',     label:'Ojos / Optometría',   icon:'👁', cls:'area-ojos',    desc:'Examen visual'},
  {id:'otro',     label:'Especialidad',        icon:'⚕️', cls:'area-otro',    desc:'Especialista del día'},
];

// ── SYMPTOMS ──────────────────────────────────────────────────────────────
const SYMS = ['fiebre','diarrea','vomitos','dolor_cabeza','dolor_articular','tos','hongos'];
const SYM_ICO = {fiebre:'🌡️',diarrea:'💧',vomitos:'🤢',dolor_cabeza:'🤕',dolor_articular:'🦴',tos:'😮‍💨',hongos:'🍄'};
const SYM_LBL = {
  es:{fiebre:'Fiebre',diarrea:'Diarrea',vomitos:'Vómitos',dolor_cabeza:'Dolor cabeza',dolor_articular:'Dolor articular',tos:'Tos',hongos:'Hongos'},
  en:{fiebre:'Fever',diarrea:'Diarrhea',vomitos:'Vomiting',dolor_cabeza:'Headache',dolor_articular:'Joint pain',tos:'Cough',hongos:'Fungal'}
};

// ── CONDITIONS ────────────────────────────────────────────────────────────
const CONDS = ['hipertension','diabetes','parkinson','artritis','alergias','desnutricion'];
const COND_LBL = {
  es:{hipertension:'Hipertensión',diabetes:'Diabetes',parkinson:'Parkinson',artritis:'Artritis',alergias:'Alergias',desnutricion:'Desnutrición'},
  en:{hipertension:'Hypertension',diabetes:'Diabetes',parkinson:'Parkinson',artritis:'Arthritis',alergias:'Allergies',desnutricion:'Malnutrition'}
};

// ── MEDS ──────────────────────────────────────────────────────────────────
const MEDS_DEFAULT = [
  {id:'m1',n:'Acetaminofén Susp',u:'frascos'},{id:'m2',n:'Acetaminofén Masticable',u:'tab'},
  {id:'m3',n:'Acetaminofén 500mg',u:'tab'},{id:'m4',n:'Ibuprofén 200mg',u:'tab'},
  {id:'m5',n:'Amoxicilina Susp 250mg',u:'frascos'},{id:'m6',n:'Amoxicilina 500mg',u:'tab'},
  {id:'m7',n:'Ciprofloxacina 500mg',u:'tab'},{id:'m8',n:'Metformina 850mg',u:'tab'},
  {id:'m9',n:'Omeprazol 20mg',u:'tab'},{id:'m10',n:'Loratadina 10mg',u:'tab'},
  {id:'m11',n:'ExFlu 120mL',u:'frascos'},{id:'m12',n:'ExFlu Infantil 30mL',u:'frascos'},
  {id:'m13',n:'Salbutamol Inhalador',u:'inhaladores'},
];
const MED_UNITS = ['tab','frascos','inhaladores','sobres','cápsulas','ampollas','ml','g'];
const DX_COLORS = ['#5b4fcf','#7c6fd8','#9d8fe1','#be9fea','#7c3f9e'];

// ── VITAL RANGES ──────────────────────────────────────────────────────────
const VIT_RANGES = {
  systolic:  {low:90, high:140, vhigh:180},
  diastolic: {low:60, high:90,  vhigh:110},
  pulse:     {low:50, high:100, vhigh:130},
  temp_f:    {low:96, high:99.5,vhigh:102.2},
  temp_c:    {low:35.5,high:37.5,vhigh:39},
};

function vitalStatus(key, val) {
  const v = parseFloat(val);
  if (isNaN(v) || val === '') return 'empty';
  const r = VIT_RANGES[key]; if (!r) return 'ok';
  if (v >= (r.vhigh||9999) || v < r.low * 0.88) return 'alert';
  if (v > r.high || v < r.low) return 'warn';
  return 'ok';
}
function parseBP(bp) {
  if (!bp || !bp.includes('/')) return {};
  const p = bp.split('/');
  return p.length === 2 ? {sys:p[0].trim(), dia:p[1].trim()} : {};
}
// Compute alerts ONLY for touched fields
function computeAlerts(f, touched) {
  const alerts = [];
  const bp = parseBP(f.bp);
  if (touched.bp && f.bp) {
    if (bp.sys) { const s=vitalStatus('systolic',bp.sys); if(s!=='ok'&&s!=='empty') alerts.push({level:s,msg:`Presión sistólica ${bp.sys} mmHg — ${parseFloat(bp.sys)>=180?'🚨 MUY ALTA':parseFloat(bp.sys)>=140?'⚠ Alta':'⚠ Baja'}`,range:'Normal: 90–140 · Alerta: ≥180'}); }
    if (bp.dia) { const s=vitalStatus('diastolic',bp.dia); if(s!=='ok'&&s!=='empty') alerts.push({level:s,msg:`Presión diastólica ${bp.dia} mmHg — ${parseFloat(bp.dia)>=90?'⚠ Alta':'⚠ Baja'}`,range:'Normal: 60–90'}); }
  }
  if (touched.pulse && f.pulse) { const s=vitalStatus('pulse',f.pulse); if(s!=='ok'&&s!=='empty') alerts.push({level:s,msg:`Pulso ${f.pulse} bpm — ${parseFloat(f.pulse)>=130?'🚨 MUY ALTO':parseFloat(f.pulse)>=100?'⚠ Alto':'⚠ Bajo'}`,range:'Normal: 50–100 · Alerta: ≥130'}); }
  if (touched.temp && f.tempVal) { const k=f.tempUnit==='C'?'temp_c':'temp_f'; const s=vitalStatus(k,f.tempVal); if(s!=='ok'&&s!=='empty') alerts.push({level:s,msg:`Temperatura ${f.tempVal}°${f.tempUnit} — ${parseFloat(f.tempVal)>=(f.tempUnit==='C'?37.5:99.5)?'🌡️ FIEBRE':'⚠ Baja'}`,range:f.tempUnit==='F'?'Normal: 96–99.5°F · Fiebre: ≥102.2°F':'Normal: 35.5–37.5°C · Fiebre: ≥39°C'}); }
  return alerts;
}
function vitBorderClass(field, val, touched, tempUnit) {
  if (!touched[field] || !val) return '';
  let key, v;
  if (field==='bp') { const bp=parseBP(val); if(!bp.sys) return ''; key='systolic'; v=bp.sys; }
  else if (field==='pulse') { key='pulse'; v=val; }
  else if (field==='temp') { key=tempUnit==='C'?'temp_c':'temp_f'; v=val; }
  const s = vitalStatus(key, v);
  if (s==='alert') return 'vit-alert';
  if (s==='warn') return 'vit-warn';
  if (s==='ok') return 'vit-ok';
  return '';
}

// ── HELPERS ───────────────────────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
};
const tnow     = () => new Date().toLocaleTimeString('es-GT',{hour:'2-digit',minute:'2-digit'});
const genCode  = () => Math.random().toString(36).substr(2,5).toUpperCase();
const genMedId = () => 'mx_' + Math.random().toString(36).substr(2,6);

// ── STATE ─────────────────────────────────────────────────────────────────
function defaultState() {
  try { const sv = JSON.parse(localStorage.getItem('elfaro_v10') || '{}'); return {
    lang: sv.lang || 'es',
    station: null, pinTarget: null, pinInput: '', pinError: false,
    setupDone: false,
    actLoc: sv.actLoc || '', actDate: sv.actDate || todayStr(),
    especialidadDelDia: sv.especialidadDelDia || '',
    operators: sv.operators || ['María López','Juan García','Ana Pérez','Pedro Chumil'],
    currentOperator: sv.currentOperator || '',
    patients: sv.patients || [],
    dayCounter: sv.dayCounter || 0,
    meds: sv.meds || [...MEDS_DEFAULT],
    inventory: sv.inventory || Object.fromEntries(MEDS_DEFAULT.map(m=>[m.id,20])),
    initInventory: sv.initInventory || Object.fromEntries(MEDS_DEFAULT.map(m=>[m.id,20])),
    villages: sv.villages || ['San Lucas Tolimán','Cerro de Oro','San Antonio Palopó','Santa Catarina Palopó','Panabaj'],
    selPatient: null, docRx: {}, patView: 'main',
    adminTab: 'stats', stTab: 'registro', newV: '',
    newMedName: '', newMedUnit: 'tab', newMedQty: 0, showNewMedForm: false,
    stationOperator: sv.stationOperator || '',
    vitF: { patientId:'', bp:'', pulse:'', resp:'', weightKg:'', weightLb:'', tempVal:'', tempUnit:'C', areas:[], touched:{bp:false,pulse:false,temp:false},
      symptoms: Object.fromEntries(SYMS.map(s=>[s,false])), symptomsOther:'',
      conditions: Object.fromEntries(CONDS.map(c=>[c,false])), conditionsOther:'' },
    inscF: { nombre:'',apellido:'',age:'',gender:'',phone:'',aldeaPaciente:'',pregnant:false,breastfeeding:false },
  };} catch(e) { return defaultState(); }
}

let S = defaultState();
const L = () => S.lang;

function saveLocal() {
  try { localStorage.setItem('elfaro_v10', JSON.stringify({
    lang:S.lang, actLoc:S.actLoc, actDate:S.actDate, especialidadDelDia:S.especialidadDelDia,
    patients:S.patients, dayCounter:S.dayCounter, meds:S.meds,
    inventory:S.inventory, initInventory:S.initInventory, villages:S.villages,
  })); } catch(e) {}
}

function set(u) {
  Object.assign(S, u);
  saveLocal();
  const clinicalKeys = ['patients','inventory','meds','initInventory'];
  if (Object.keys(u).some(k => clinicalKeys.includes(k)) && typeof syncFullState === 'function') {
    syncFullState(S);
  }
  render();
}

function pushFB() { if (typeof syncFullState === 'function') syncFullState(S); }

// ── LOGO ──────────────────────────────────────────────────────────────────
let LOGO_B64 = '';
(function() {
  const img = new Image();
  img.onload = function() {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img,0,0);
    try { LOGO_B64 = c.toDataURL('image/jpeg',0.85); render(); } catch(e) { render(); }
  };
  img.onerror = () => render();
  img.src = LOGO_PATH;
})();

// ── SERVICE WORKER ────────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW:', e));
}

// ── TOAST ─────────────────────────────────────────────────────────────────
let toastT = null;
function toast(msg) {
  const el = document.getElementById('tst');
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.style.display = 'none'; }, 2400);
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function toggleSym(k)  { S.vitF.symptoms[k] = !S.vitF.symptoms[k]; render(); }
function toggleCond(k) { S.vitF.conditions[k] = !S.vitF.conditions[k]; render(); }
function toggleVitArea(id) {
  const arr = S.vitF.areas;
  if (arr.includes(id)) S.vitF.areas = arr.filter(x => x !== id);
  else if (arr.length < 3) S.vitF.areas = [...arr, id];
  else { toast('Máximo 3 áreas'); return; }
  render();
}
function tempConvert() {
  // Read live value from DOM input in case user typed without triggering oninput
  const inp = document.getElementById('inp-temp');
  if (inp && inp.value) S.vitF.tempVal = inp.value;
  const v = parseFloat(S.vitF.tempVal); if (isNaN(v)) return;
  if (S.vitF.tempUnit === 'F') { S.vitF.tempUnit='C'; S.vitF.tempVal=((v-32)*5/9).toFixed(1); }
  else { S.vitF.tempUnit='F'; S.vitF.tempVal=((v*9/5)+32).toFixed(1); }
  render();
}
const t = (es, en) => S.lang === 'es' ? es : en;

// ── FIREBASE SUBSCRIPTION ─────────────────────────────────────────────────
function initSession() {
  if (typeof initFirebase === 'function') initFirebase();
  if (typeof subscribeToSession === 'function' && S.actLoc && S.actDate) {
    const key = setSessionKey(S.actDate, S.actLoc);
    subscribeToSession(key, data => {
      let changed = false;
      if (data.patients) {
        const incoming = typeof data.patients === 'object' && !Array.isArray(data.patients)
          ? Object.values(data.patients)
          : data.patients;
        S.patients = incoming;
        changed = true;
      }
      if (data.inventory) {
        S.inventory = (typeof data.inventory === 'object' && data.inventory.inventory)
          ? data.inventory.inventory : data.inventory;
        changed = true;
      }
      if (data.meds) {
        const medsArr = Array.isArray(data.meds) ? data.meds : Object.values(data.meds);
        if (medsArr.length) S.meds = medsArr;
      }
      if (data.initInventory) S.initInventory = data.initInventory;
      // Sync villages across all devices
      if (data.villages && Array.isArray(data.villages) && data.villages.length) {
        S.villages = data.villages;
        changed = true;
      }
      // Sync operators across all devices
      if (data.operators && Array.isArray(data.operators) && data.operators.length) {
        S.operators = data.operators;
        changed = true;
      }
      if (changed) { saveLocal(); render(); }
    });
  }
}

// ── RENDER ────────────────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app'); if (!app) return;
  if (!S.setupDone) { renderSetup(app); return; }
  if (!S.station)   { renderLogin(app); return; }

  const stMap = {
    inscripcion: {lbl:t('Inscripción','Registration'),    ico:'📋'},
    vitales:     {lbl:t('Signos Vitales','Vital Signs'),  ico:'💓'},
    medico:      {lbl:t('Médicos','Doctors'),             ico:'🩺'},
    dental:      {lbl:t('Dental','Dental'),               ico:'🦷'},
    ojos:        {lbl:t('Ojos','Eyes'),                   ico:'👁'},
    especialidad:{lbl:S.especialidadDelDia||t('Especialidad','Specialty'), ico:'⚕️'},
    farmacia:    {lbl:t('Farmacia','Pharmacy'),           ico:'💊'},
    espiritual:  {lbl:t('Clínica Espiritual','Spiritual Clinic'), ico:'✝️'},
    admin:       {lbl:'Admin',                            ico:'⚙️'},
  };
  const st = stMap[S.station] || {lbl:S.station, ico:'⚕️'};
  const logo = LOGO_B64 ? `<img src="${LOGO_B64}" class="hdr-logo" alt="El Faro"/>` : `<span style="font-weight:700;font-size:13px">El Faro</span>`;

  app.innerHTML = `
    <div id="sync-bar" class="sync">✓ ${S.actLoc} · ${S.actDate}${S.currentOperator?' · 👤 '+S.currentOperator:''}</div>
    <div class="hdr">${logo}<div class="hdr-sep"></div>
      <div class="hdr-info"><div class="hdr-st">${st.ico} ${st.lbl}</div><div class="hdr-dt">${S.actDate}</div></div>
      <button class="exit-btn" onclick="set({station:null,selPatient:null,patView:'main'})">← ${t('Salir','Exit')}</button>
    </div>
    <div class="lbar" style="justify-content:space-between;padding:4px 12px">
      <div class="ltg">
        <button class="lt ${S.lang==='es'?'on':''}" onclick="set({lang:'es'})">ES</button>
        <button class="lt ${S.lang==='en'?'on':''}" onclick="set({lang:'en'})">EN</button>
      </div>
      <div style="display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;color:var(--g6)">👤</span>
        <select onchange="S.stationOperator=this.value" style="border:1px solid var(--g2);border-radius:20px;font-size:10px;padding:2px 6px;font-family:var(--fn);background:var(--g1);color:var(--g9)">
          <option value="">${t('Operador','Operator')}...</option>
          ${S.operators.map(op=>`<option value="${op}" ${(S.stationOperator||S.currentOperator)===op?'selected':''}>${op}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="con" id="con"></div>`;

  const con = document.getElementById('con');
  if      (S.station==='inscripcion')  con.innerHTML = renderInscripcion();
  else if (S.station==='vitales')      con.innerHTML = renderVitales();
  else if (S.station==='medico')       con.innerHTML = renderQueue('doctor');
  else if (S.station==='dental')       con.innerHTML = renderDental();
  else if (S.station==='ojos')         con.innerHTML = renderOjos();
  else if (S.station==='especialidad') con.innerHTML = renderQueue('otro');
  else if (S.station==='farmacia')     con.innerHTML = renderFarmacia();
  else if (S.station==='espiritual')   con.innerHTML = renderEspiritual();
  else                                 con.innerHTML = renderAdmin();
}

// ── SETUP ─────────────────────────────────────────────────────────────────
function renderSetup(app) {
  const logo = LOGO_B64 ? `<img src="${LOGO_B64}" class="login-logo" alt="El Faro"/>` : `<div style="font-weight:700;font-size:22px">El Faro</div>`;
  app.innerHTML = `
    <div class="login-hdr">${logo}<div style="font-size:12px;color:var(--g6)">${t('Jornada Médica Móvil','Mobile Medical Mission')}</div></div>
    <div class="lbar"><div class="ltg">
      <button class="lt ${S.lang==='es'?'on':''}" onclick="set({lang:'es'})">ES</button>
      <button class="lt ${S.lang==='en'?'on':''}" onclick="set({lang:'en'})">EN</button>
    </div></div>
    <div class="con">
      <div style="font-size:13px;font-weight:600;margin-bottom:14px;text-align:center">⚙️ ${t('Configurar jornada','Session setup')}</div>
      <div class="setup-card">
        <div class="setup-label">📍 ${t('Aldea de la jornada','Session village')}</div>
        <select id="setup-loc" class="setup-sel">
          <option value="">${t('Selecciona...','Select...')}</option>
          ${S.villages.map(v=>`<option value="${v}">${v}</option>`).join('')}
        </select>
      </div>
      <div class="setup-card">
        <div class="setup-label">📅 ${t('Fecha','Date')}</div>
        <input type="date" id="setup-date" class="setup-sel" value="${S.actDate || new Date().toISOString().split('T')[0]}"/>
      </div>
      <div class="setup-card">
        <div class="setup-label">👤 ${t('Operador / Responsable','Operator / Responsible')}</div>
        <select id="setup-operator" class="setup-sel">
          <option value="">— ${t('Seleccionar operador','Select operator')} —</option>
          ${S.operators.map(op=>`<option value="${op}" ${S.currentOperator===op?'selected':''}>${op}</option>`).join('')}
        </select>
        <div style="font-size:10px;color:var(--g6);margin-top:5px">${t('Quién está registrando datos hoy','Who is recording data today')}</div>
      </div>
      <div class="setup-card">
        <div class="setup-label">⚕️ ${t('Especialidad del día (opcional)','Specialty of the day (optional)')}</div>
        <input id="setup-esp" class="setup-sel" placeholder="${t('Ej: Traumatología, Nutrición...','E.g. Orthopedics, Nutrition...')}" value="${S.especialidadDelDia}"/>
        <div style="font-size:10px;color:var(--g6);margin-top:5px">${t('Si hay especialista hoy. Si no, déjalo vacío.','If there is a guest specialist today. Otherwise, leave blank.')}</div>
      </div>
      <button class="start-btn" onclick="startSession()">→ ${t('Iniciar jornada','Start session')}</button>
    </div>`;
}
function startSession() {
  const loc = document.getElementById('setup-loc')?.value || '';
  const dt  = document.getElementById('setup-date')?.value || todayStr();
  const esp = document.getElementById('setup-esp')?.value || '';
  if (!loc) { toast('⚠ ' + t('Selecciona la aldea','Select the village')); return; }
  const op = document.getElementById('setup-operator')?.value || '';
  S.actLoc = loc; S.actDate = dt; S.especialidadDelDia = esp;
  S.currentOperator = op;
  S.setupDone = true; S.dayCounter = 0;
  saveLocal();
  initSession();
  render();
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function renderLogin(app) {
  const logo = LOGO_B64 ? `<img src="${LOGO_B64}" class="login-logo" alt="El Faro"/>` : `<div style="font-weight:700;font-size:22px">El Faro</div>`;
  let h = `
    <div class="login-hdr">${logo}
      <div style="font-size:12px;color:var(--g6)">${t('Jornada Médica Móvil','Mobile Medical Mission')}</div>
      <div style="font-size:10px;color:var(--tl);font-family:var(--mo)">📍 ${S.actLoc} · ${S.actDate}</div>
    </div>
    <div class="lbar"><div class="ltg">
      <button class="lt ${S.lang==='es'?'on':''}" onclick="set({lang:'es'})">ES</button>
      <button class="lt ${S.lang==='en'?'on':''}" onclick="set({lang:'en'})">EN</button>
    </div></div>
    <div class="con"><div class="pin-scr">`;
  if (!S.pinTarget) {
    const espBtn = S.especialidadDelDia ? `<button class="sb a" onclick="set({pinTarget:'especialidad',pinInput:'',pinError:false})"><div class="si">⚕️</div><div class="sn" style="color:var(--am)">${S.especialidadDelDia}</div><div class="sd">${t('Especialidad del día','Today\'s specialty')}</div></button>` : '';
    h += `<div class="sg">
      <button class="sb t"   onclick="set({pinTarget:'inscripcion',pinInput:'',pinError:false})"><div class="si">📋</div><div class="sn" style="color:var(--tl)">${t('Inscripción','Registration')}</div><div class="sd">${t('Datos del paciente','Patient data')}</div></button>
      <button class="sb gn"  onclick="set({pinTarget:'vitales',pinInput:'',pinError:false})"><div class="si">💓</div><div class="sn" style="color:var(--gn)">${t('Signos Vitales','Vital Signs')}</div><div class="sd">BP · Peso · Áreas</div></button>
      <button class="sb p"   onclick="set({pinTarget:'medico',pinInput:'',pinError:false})"><div class="si">🩺</div><div class="sn" style="color:var(--pu)">${t('Médicos','Doctors')}</div><div class="sd">${t('Diagnóstico y receta','Diagnosis & Rx')}</div></button>
      <button class="sb bl"  onclick="set({pinTarget:'dental',pinInput:'',pinError:false})"><div class="si">🦷</div><div class="sn" style="color:var(--blue)">Dental</div><div class="sd">${t('Odontología','Dentistry')}</div></button>
      <button class="sb tl2" onclick="set({pinTarget:'ojos',pinInput:'',pinError:false})"><div class="si">👁</div><div class="sn" style="color:var(--teal2)">${t('Ojos','Eyes')}</div><div class="sd">${t('Optometría','Optometry')}</div></button>
      ${espBtn}
      <button class="sb a"   onclick="set({pinTarget:'farmacia',pinInput:'',pinError:false})"><div class="si">💊</div><div class="sn" style="color:var(--am)">${t('Farmacia','Pharmacy')}</div><div class="sd">${t('Despacho','Dispensing')}</div></button>
      <button class="sb sp2" onclick="set({pinTarget:'espiritual',pinInput:'',pinError:false})"><div class="si">✝️</div><div class="sn" style="color:var(--sp)">${t('Clínica Espiritual','Spiritual Clinic')}</div><div class="sd">${t('Seguimiento','Follow-up')}</div></button>
      <button class="sb g" style="grid-column:span 2" onclick="set({pinTarget:'admin',pinInput:'',pinError:false})"><div class="si">⚙️</div><div class="sn" style="color:var(--g6)">Admin</div><div class="sd">${t('Inventario · Stats','Inventory · Stats')}</div></button>
    </div>
    <button onclick="set({setupDone:false})" style="font-size:10px;color:var(--g4);background:none;border:none;cursor:pointer;font-family:var(--fn)">⚙ ${t('Cambiar configuración','Change settings')}</button>`;
  } else {
    const names = {inscripcion:t('Inscripción','Registration'),vitales:t('Signos Vitales','Vital Signs'),medico:t('Médicos','Doctors'),dental:'Dental',ojos:t('Ojos','Eyes'),especialidad:S.especialidadDelDia||t('Especialidad','Specialty'),farmacia:t('Farmacia','Pharmacy'),espiritual:t('Clínica Espiritual','Spiritual'),admin:'Admin'};
    h += `<div style="font-size:12px;color:var(--g6)">${t('PIN de','PIN for')}: <strong>${names[S.pinTarget]||S.pinTarget}</strong></div>
    <div class="pdots">${[0,1,2,3].map(i=>`<div class="pd ${S.pinInput.length>i?'f':''} ${S.pinError?'e':''}"></div>`).join('')}</div>
    ${S.pinError?`<div style="color:var(--rd);font-size:12px;font-weight:500">${t('PIN incorrecto','Incorrect PIN')}</div>`:''}
    <div class="kp">${['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k=>k===''?`<div></div>`:`<button class="kk" onclick="pinKey('${k==='⌫'?'del':k}')">${k}</button>`).join('')}</div>
    <button onclick="set({pinTarget:null,pinInput:''})" style="font-size:12px;color:var(--g6);background:none;border:none;cursor:pointer;padding:6px;font-family:var(--fn)">← ${t('Volver','Back')}</button>`;
  }
  h += `</div></div>`; app.innerHTML = h;
}
function pinKey(k) {
  if (k==='del') { set({pinInput:S.pinInput.slice(0,-1)}); return; }
  const nx = S.pinInput + k;
  if (nx.length===4) {
    if (nx===PINS[S.pinTarget]) set({station:S.pinTarget,pinTarget:null,pinInput:''});
    else { set({pinInput:nx,pinError:true}); setTimeout(()=>set({pinInput:'',pinError:false}),700); }
  } else set({pinInput:nx});
}

// ── INSCRIPCIÓN ────────────────────────────────────────────────────────────
function renderInscripcion() {
  const f = S.inscF;
  const tod = S.patients.filter(p => p.date === S.actDate);
  let h = `<div class="tabs">
    <button class="tab ${S.stTab==='registro'?'on':''}" onclick="set({stTab:'registro'})">📋 ${t('Nueva ficha','New form')}</button>
    <button class="tab ${S.stTab==='lista'?'on':''}" onclick="set({stTab:'lista'})">${t('Hoy','Today')} (${tod.length})</button>
  </div>`;
  if (S.stTab === 'registro') {
    h += `
    <div class="flow-steps">
      <div class="flow-step active"><div class="flow-dot">1</div>${t('Datos','Data')}</div>
      <div class="flow-line"></div>
      <div class="flow-step"><div class="flow-dot">2</div>${t('Signos V.','Vitals')}</div>
      <div class="flow-line"></div>
      <div class="flow-step"><div class="flow-dot">3</div>${t('Áreas','Areas')}</div>
      <div class="flow-line"></div>
      <div class="flow-step"><div class="flow-dot">4</div>Cola</div>
    </div>
    <div class="stl">👤 ${t('Datos del paciente','Patient data')}</div>
    <div class="r2">
      <div class="fld"><label>${t('Nombre','First name')}</label><input value="${f.nombre}" oninput="S.inscF.nombre=this.value" placeholder="María"/></div>
      <div class="fld"><label>${t('Apellido','Last name')}</label><input value="${f.apellido}" oninput="S.inscF.apellido=this.value" placeholder="García"/></div>
    </div>
    <div class="r3">
      <div class="fld"><label>${t('Edad','Age')}</label><input type="number" value="${f.age}" oninput="S.inscF.age=this.value" placeholder="${t('años','yrs')}"/></div>
      <div class="fld"><label>${t('Género','Gender')}</label><select onchange="S.inscF.gender=this.value;render()">
        <option value="">--</option><option value="M" ${f.gender==='M'?'selected':''}>${t('M','M')}</option><option value="F" ${f.gender==='F'?'selected':''}>${t('F','F')}</option>
      </select></div>
      <div class="fld"><label>${t('Teléfono','Phone')}</label><input type="tel" value="${f.phone}" oninput="S.inscF.phone=this.value" placeholder="####-####"/></div>
    </div>
    <div class="fld"><label>📍 ${t('Aldea del paciente',"Patient's village")}</label>
      <div class="aldea-row"><span style="font-size:14px">🏘️</span>
        <select onchange="S.inscF.aldeaPaciente=this.value">
          <option value="">— ${t('Seleccionar','Select')} —</option>
          ${S.villages.map(v=>`<option value="${v}" ${f.aldeaPaciente===v?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
    </div>
    ${f.gender==='F'?`<div class="r2" style="margin-bottom:11px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" ${f.pregnant?'checked':''} onchange="S.inscF.pregnant=this.checked"> ${t('Embarazada','Pregnant')}</label>
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" ${f.breastfeeding?'checked':''} onchange="S.inscF.breastfeeding=this.checked"> ${t('Dando pecho','Breastfeeding')}</label>
    </div>`:''}
    <div style="background:var(--tll);border-radius:8px;padding:10px 12px;margin:12px 0;font-size:11px;color:var(--tl)">
      💓 <strong>${t('Siguiente paso:','Next step:')}</strong> ${t('Síntomas, condiciones y áreas de atención se registran en Signos Vitales (enfermería).','Symptoms, conditions and areas of care are recorded at Vital Signs (nursing).')}
    </div>
    <button class="btn bt" onclick="submitPat()">${t('Registrar →','Register →')}</button>`;
  } else {
    if (!tod.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">📋</div>${t('Sin pacientes hoy','No patients today')}</div>`;
    else tod.forEach(p => {
      const sc = !p.vitalsAt?'svit':p.status==='waiting'?'sw':p.status==='attending'?'sa':p.status==='prescribed'?'spr':'sd2';
      const sl = !p.vitalsAt?t('⏳ Sin signos','⏳ No vitals'):p.status==='waiting'?t('En espera','Waiting'):p.status==='attending'?t('Atendiendo','In consult'):p.status==='prescribed'?t('Con receta','Prescribed'):t('Entregado','Delivered');
      const ai = (p.areas||[]).map(a=>AREAS.find(x=>x.id===a)?.icon||'').join(' ');
      h += `<div class="card ct">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
          <span class="stbdg ${sc}">${sl}</span>
        </div>
        <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
        <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.gender==='M'?t('Masc','Male'):t('Fem','Female')}${p.phone?' · 📞 '+p.phone:''}</div>
        <div style="font-size:10px;color:var(--tl);margin-top:1px">📍 ${p.aldeaPaciente||'—'} ${ai?'· '+ai:''}</div>
      </div>`;
    });
  }
  return h;
}
function submitPat() {
  const f = S.inscF;
  if (!f.nombre || !f.age) { toast('⚠ ' + t('Nombre y edad requeridos','Name and age required')); return; }
  S.dayCounter++;
  const p = {
    nombre:f.nombre, apellido:f.apellido, name:`${f.nombre} ${f.apellido}`.trim(),
    age:f.age, gender:f.gender, phone:f.phone||'',
    pregnant:f.pregnant||false, breastfeeding:f.breastfeeding||false,
    aldeaPaciente:f.aldeaPaciente||S.actLoc,
    // symptoms & conditions filled in at Signos Vitales
    symptoms:Object.fromEntries(SYMS.map(s=>[s,false])), symptomsOther:'',
    conditions:Object.fromEntries(CONDS.map(c=>[c,false])), conditionsOther:'',
    code:genCode(), dayNum:S.dayCounter, id:S.dayCounter+'_'+genCode(),
    registradoPor:S.currentOperator||'',
    areas:[], status:'waiting', createdAt:tnow(), date:S.actDate, location:S.actLoc,
    bp:'',pulse:'',resp:'',weightKg:'',weightLb:'',temp:'',tempUnit:'C',vitalsAt:'',
    deliveryChecked:[], deliveryHistory:[],
    spiritual:{prayed:false,accepted:false,reconciled:false,interested:false,notes:''},
    dental:{rellenos:0,extracciones:0,rayosX:false,tratEspecial:false,notas:'',medico:''},
    ojos:{antLectura:false,antSol:false,colirio:false,cirugia:false,notas:'',medico:''},
    doctor:{diagnostico:'',notas:'',medico:'',seguimiento:false,prescription:[],prescribedAt:''},
  };
  S.patients = [p, ...S.patients];
  S.inscF = { nombre:'',apellido:'',age:'',gender:'',phone:'',aldeaPaciente:'',pregnant:false,breastfeeding:false };
  if (typeof syncPatient === 'function') syncPatient(p);
  if (SHEETS_URL && !SHEETS_URL.includes('REEMPLAZA')) {
    fetch(SHEETS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'new_patient',data:p})}).catch(()=>{});
  }
  toast(`✓ #${p.dayNum} ${p.nombre} ${p.apellido} · 🔥 Sincronizando...`);
  set({stTab:'lista'});
}

// ── SIGNOS VITALES ────────────────────────────────────────────────────────
function renderVitales() {
  if (S.selPatient) {
    const p = S.selPatient;
    const f = S.vitF;
    const alerts = computeAlerts(f, f.touched);
    const allTouched = f.touched.bp && f.touched.pulse && f.touched.temp;
    const allOk = allTouched && alerts.length === 0 && f.bp && f.pulse && f.tempVal;
    let h = `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:9px;font-family:var(--fn)">← ${t('Volver','Back')}</button>
    <div class="flow-steps">
      <div class="flow-step done"><div class="flow-dot">✓</div>${t('Datos','Data')}</div>
      <div class="flow-line done"></div>
      <div class="flow-step active"><div class="flow-dot">2</div>${t('Signos V.','Vitals')}</div>
      <div class="flow-line ${f.areas.length>0?'done':''}"></div>
      <div class="flow-step ${f.areas.length>0?'active':''}"><div class="flow-dot">${f.areas.length||'3'}</div>${t('Áreas','Areas')}</div>
      <div class="flow-line"></div>
      <div class="flow-step"><div class="flow-dot">4</div>Cola</div>
    </div>
    <div class="card cgn">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
        <span style="font-size:10px;color:var(--g6)">${p.createdAt}</span>
      </div>
      <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.gender==='M'?t('Masc','Male'):t('Fem','Female')}${p.phone?' · 📞 '+p.phone:''}</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
    </div>

    <!-- Alerts: only after blur, not while typing -->
    ${alerts.map(a=>`<div class="alert-box ${a.level==='alert'?'alert-rd':'alert-am'}">
      <span style="font-size:18px">${a.level==='alert'?'🚨':'⚠️'}</span>
      <div><div style="font-weight:600;margin-bottom:2px">${a.msg}</div><div style="font-size:10px;opacity:.8">${a.range}</div></div>
    </div>`).join('')}
    ${allOk?`<div class="alert-box alert-gn"><span style="font-size:16px">✅</span><div><strong>${t('Valores en rango normal','Values in normal range')}</strong></div></div>`:''}

    <div class="stl">💓 ${t('Signos Vitales','Vital Signs')}</div>

    <div class="fld">
      <label>${t('Presión arterial','Blood pressure')} (mmHg)</label>
      <input type="text" inputmode="text" value="${f.bp}" placeholder="120/80"
        class="${vitBorderClass('bp',f.bp,f.touched,f.tempUnit)}"
        oninput="S.vitF.bp=this.value"
        onblur="S.vitF.touched.bp=true;render()"/>
      <div class="range-hint">${t('Normal: 90–140 / 60–90','Normal: 90–140 / 60–90')}</div>
    </div>
    <div class="r2">
      <div class="fld">
        <label>${t('Pulso','Pulse')} (bpm)</label>
        <input type="number" inputmode="numeric" value="${f.pulse}" placeholder="72"
          class="${vitBorderClass('pulse',f.pulse,f.touched,f.tempUnit)}"
          oninput="S.vitF.pulse=this.value"
          onblur="S.vitF.touched.pulse=true;render()"/>
        <div class="range-hint">${t('Normal: 50–100','Normal: 50–100')}</div>
      </div>
      <div class="fld">
        <label>${t('Respiraciones','Respirations')} (/min)</label>
        <input type="number" inputmode="numeric" value="${f.resp}" placeholder="16" oninput="S.vitF.resp=this.value"/>
        <div class="range-hint">${t('Normal: 12–20','Normal: 12–20')}</div>
      </div>
    </div>
    <div class="r2">
      <div class="fld">
        <label>⚖️ ${t('Peso (kg)','Weight (kg)')}</label>
        <input type="text" inputmode="decimal" value="${f.weightKg}" placeholder="kg"
          oninput="S.vitF.weightKg=this.value;if(parseFloat(this.value)>0)S.vitF.weightLb=(parseFloat(this.value)*2.20462).toFixed(1)"/>
      </div>
      <div class="fld">
        <label>⚖️ ${t('Peso (lb)','Weight (lb)')}</label>
        <input type="text" inputmode="decimal" value="${f.weightLb}" placeholder="lb"
          oninput="S.vitF.weightLb=this.value;if(parseFloat(this.value)>0)S.vitF.weightKg=(parseFloat(this.value)*0.453592).toFixed(1)"/>
      </div>
    </div>
    <div class="fld">
      <label>🌡️ ${t('Temperatura','Temperature')} °${f.tempUnit}</label>
      <div style="display:flex;gap:8px">
        <input id="inp-temp" type="number" inputmode="decimal" step="0.1" value="${f.tempVal}" placeholder="${f.tempUnit==='F'?'98.6':'37.0'}"
          class="${vitBorderClass('temp',f.tempVal,f.touched,f.tempUnit)}"
          style="flex:1"
          oninput="S.vitF.tempVal=this.value"
          onblur="S.vitF.touched.temp=true;render()"/>
        <button type="button" onclick="tempConvert()" style="padding:9px 14px;border:1.5px solid var(--g2);border-radius:8px;background:var(--g1);font-size:12px;cursor:pointer;font-family:var(--fn);font-weight:500;white-space:nowrap">
          ⇄ °${f.tempUnit==='F'?'C':'F'}
        </button>
      </div>
      <div class="range-hint">${f.tempUnit==='F'?t('Normal: 96–99.5°F · Fiebre: ≥102.2°F','Normal: 96–99.5°F · Fever: ≥102.2°F'):t('Normal: 35.5–37.5°C · Fiebre: ≥39°C','Normal: 35.5–37.5°C · Fever: ≥39°C')}</div>
    </div>

    <div class="hr"></div>

    <!-- SÍNTOMAS -->
    <div class="stl">🤒 ${t('Síntomas','Symptoms')}</div>
    <div class="chip-grid">${SYMS.map(s=>`<button type="button" class="chip ${f.symptoms?.[s]?'on-rd':''}" onclick="toggleSym('${s}')">${SYM_ICO[s]} ${SYM_LBL[S.lang][s]}</button>`).join('')}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:11px;color:var(--g4);white-space:nowrap">+ ${t('Otro síntoma','Other')}</span>
      <input type="text" value="${f.symptomsOther||''}" oninput="S.vitF.symptomsOther=this.value"
        placeholder="${t('Describir otro síntoma...','Describe other symptom...')}"
        style="flex:1;padding:6px 11px;border:1.5px dashed var(--g2);border-radius:20px;font-size:12px;font-family:var(--fn);background:var(--w);color:var(--g9)"/>
    </div>

    <!-- CONDICIONES -->
    <div class="stl">⚕️ ${t('Condiciones / Antecedentes','Conditions / History')}</div>
    <div class="chip-grid">${CONDS.map(c=>`<button type="button" class="chip ${f.conditions?.[c]?'on-am':''}" onclick="toggleCond('${c}')">🩺 ${COND_LBL[S.lang][c]}</button>`).join('')}</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:11px;color:var(--g4);white-space:nowrap">+ ${t('Otra condición','Other')}</span>
      <input type="text" value="${f.conditionsOther||''}" oninput="S.vitF.conditionsOther=this.value"
        placeholder="${t('Ej: epilepsia, insuf. renal...','E.g. epilepsy, renal failure...')}"
        style="flex:1;padding:6px 11px;border:1.5px dashed var(--g2);border-radius:20px;font-size:12px;font-family:var(--fn);background:var(--w);color:var(--g9)"/>
    </div>

    <div class="hr"></div>
    <div class="stl">🏥 ${t('Área de atención','Area of care')}</div>
    <div style="font-size:11px;color:var(--g6);margin-bottom:10px;background:var(--gnl);border-radius:7px;padding:8px 10px">
      ${t('La enfermera define según evaluación','Nurse assigns based on evaluation')} · <strong>${f.areas.length}/3</strong>
    </div>
    ${AREAS.filter(a=>a.id!=='otro'||S.especialidadDelDia).map(a=>{
      const isOn=f.areas.includes(a.id);
      const lbl=a.id==='otro'&&S.especialidadDelDia?S.especialidadDelDia:a.label;
      const dsc=a.id==='otro'&&S.especialidadDelDia?`${t('Especialidad:','Specialty:')} ${S.especialidadDelDia}`:a.desc;
      return`<button type="button" class="area-chip ${a.cls} ${isOn?'on':''}" onclick="toggleVitArea('${a.id}')">
        <span class="area-icon">${a.icon}</span>
        <div class="area-text"><div class="area-name">${lbl}</div><div class="area-desc">${dsc}</div></div>
        <div class="area-check">${isOn?'✓':''}</div>
      </button>`;
    }).join('')}

    <div style="margin-top:13px">
      <button class="btn ${f.areas.length>0?'btn-gn':'bg'}" onclick="saveVitals('${p.id}')"
        style="opacity:${f.areas.length>0?1:0.5}">
        ✓ ${t('Guardar y enviar a cola','Save and send to queue')}${f.areas.length===0?' — '+t('selecciona al menos 1 área','select at least 1 area'):''}
      </button>
    </div>`;
    return h;
  }

  const sinVit = S.patients.filter(p=>p.date===S.actDate&&!p.vitalsAt);
  const conVit = S.patients.filter(p=>p.date===S.actDate&&p.vitalsAt);
  let h = `<div class="stl">💓 ${t('Signos Vitales','Vital Signs')} — ${t('Pendientes','Pending')} (${sinVit.length})</div>`;
  if (!sinVit.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">✅</div>${t('Todos tienen signos vitales','All have vitals')}</div>`;
  else sinVit.forEach(p=>{
    h += `<div class="qi" onclick="selVitals('${p.id}')">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
        <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.gender} · ${p.createdAt}</div>
        <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
      </div>
      <span style="font-size:18px">💓</span>
    </div>`;
  });
  if (conVit.length) {
    h += `<div class="stl" style="margin-top:13px;color:var(--g6)">✅ ${t('Con signos vitales','With vitals')} (${conVit.length})</div>`;
    conVit.forEach(p=>{
      const touched={bp:true,pulse:true,temp:true};
      const alerts=computeAlerts({bp:p.bp,pulse:p.pulse,tempVal:p.temp,tempUnit:p.tempUnit||'F'},touched);
      const ai=(p.areas||[]).map(a=>AREAS.find(x=>x.id===a)?.icon||'').join(' ');
      h += `<div class="qi" style="opacity:.85" onclick="selVitals('${p.id}')">
        <div class="qnum">#${p.dayNum}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
          <div style="font-size:10px;color:var(--g6)">BP:${p.bp||'—'} · ${p.pulse||'—'}bpm · ${p.temp||'—'}°${p.tempUnit||'F'}</div>
          <div style="font-size:10px;color:var(--tl)">${ai||t('Sin áreas','No areas')}</div>
        </div>
        ${alerts.length?`<span style="font-size:16px">${alerts.some(a=>a.level==='alert')?'🚨':'⚠️'}</span>`:`<span style="font-size:13px;color:var(--gn)">✓</span>`}
      </div>`;
    });
  }
  return h;
}
function selVitals(id) {
  const p = S.patients.find(x=>x.id===id);
  S.vitF = { patientId:id, bp:p.bp||'', pulse:p.pulse||'', resp:p.resp||'',
    weightKg:p.weightKg||'', weightLb:p.weightLb||'',
    tempVal:p.temp||'', tempUnit:p.tempUnit||'C',
    areas:[...(p.areas||[])],
    symptoms:{...(p.symptoms||Object.fromEntries(SYMS.map(s=>[s,false])))},
    symptomsOther:p.symptomsOther||'',
    conditions:{...(p.conditions||Object.fromEntries(CONDS.map(c=>[c,false])))},
    conditionsOther:p.conditionsOther||'',
    touched:{bp:false,pulse:false,temp:false} };
  set({selPatient:{...p}});
}
function saveVitals(id) {
  const f = S.vitF;
  if (!f.areas.length) { toast('⚠ ' + t('Selecciona al menos un área','Select at least one area')); return; }
  // Force-touch all before saving — if critical alerts exist, warn but don't block
  const touched = {bp:true,pulse:true,temp:true};
  const alerts = computeAlerts(f, touched);
  S.patients = S.patients.map(p => p.id!==id ? p : {...p,
    bp:f.bp, pulse:f.pulse, resp:f.resp,
    weightKg:f.weightKg, weightLb:f.weightLb,
    temp:f.tempVal, tempUnit:f.tempUnit,
    symptoms:{...f.symptoms}, symptomsOther:f.symptomsOther||'',
    conditions:{...f.conditions}, conditionsOther:f.conditionsOther||'',
    areas:[...f.areas], vitalsAt:tnow(), operadorVitales:S.stationOperator||S.currentOperator||'',
    status:'waiting'});
  if (typeof syncPatient==='function') syncPatient(S.patients.find(x=>x.id===id));
  const ai = f.areas.map(a=>AREAS.find(x=>x.id===a)?.icon||'').join(' ');
  // Push full state so symptoms/conditions sync to all devices
  pushFB();
  toast(`✓ ${t('Signos guardados','Vitals saved')} · ${ai} · 🔥 Sync`);
  if (alerts.some(a=>a.level==='alert')) toast('🚨 ' + t('Alertas críticas — revisar','Critical alerts — review'));
  set({selPatient:null});
}

// ── QUEUE (Doctor / Especialidad) ─────────────────────────────────────────
function renderQueue(areaId) {
  if (S.selPatient && (S.selPatient.areas||[]).includes(areaId)) return renderDocDetail(S.selPatient);
  const areaLabel = areaId==='doctor' ? t('Médicos','Doctors') : (S.especialidadDelDia||t('Especialidad','Specialty'));
  const queue = S.patients.filter(p=>p.date===S.actDate&&(p.areas||[]).includes(areaId)&&p.vitalsAt&&(p.status==='waiting'||p.status==='attending'));
  const done  = S.patients.filter(p=>p.date===S.actDate&&(p.areas||[]).includes(areaId)&&p.vitalsAt&&(p.status==='prescribed'||p.status==='delivered'));
  const sinVit= S.patients.filter(p=>p.date===S.actDate&&(p.areas||[]).includes(areaId)&&!p.vitalsAt);
  let h = `<div class="stl">🟡 ${areaLabel} — ${t('En espera','Waiting')} (${queue.length})</div>`;
  if (sinVit.length) h += `<div style="background:var(--aml);border-radius:8px;padding:8px 11px;margin-bottom:9px;font-size:11px;color:var(--am)">⏳ ${sinVit.length} ${t('paciente(s) aún sin signos vitales','patient(s) still without vitals')}</div>`;
  if (!queue.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">✅</div>${t('Sin pacientes en espera','No patients waiting')}</div>`;
  else queue.forEach(p=>{
    const sf=SYMS.filter(s=>p.symptoms?.[s]).map(s=>SYM_ICO[s]).join('');
    const touched={bp:true,pulse:true,temp:true};
    const alerts=computeAlerts({bp:p.bp,pulse:p.pulse,tempVal:p.temp,tempUnit:p.tempUnit||'F'},touched);
    h += `<div class="qi" onclick="selDoc('${p.id}')">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido} ${sf}</div>
        <div style="font-size:10px;color:var(--g6)">BP:${p.bp||'—'} · ${p.pulse||'—'}bpm · ${p.age}a ${p.gender}</div>
        <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
        <span class="stbdg ${p.status==='waiting'?'sw':'sa'}">${p.status==='waiting'?t('En espera','Waiting'):t('Atendiendo','In consult')}</span>
        ${alerts.length?`<span style="font-size:13px">${alerts.some(a=>a.level==='alert')?'🚨':'⚠️'}</span>`:''}
      </div>
    </div>`;
  });
  if (done.length) {
    h += `<div class="stl" style="margin-top:12px;color:var(--g6)">✅ ${t('Atendidos','Done')} (${done.length})</div>`;
    done.forEach(p=>{h += `<div class="qi" style="opacity:.65" onclick="selDoc('${p.id}')">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.doctor?.diagnostico||'—'}</div></div>
      <span class="stbdg sd2">✓</span>
    </div>`;});
  }
  return h;
}
function renderDocDetail(p) {
  const rec = p.doctor || {};
  const actS = SYMS.filter(s=>p.symptoms?.[s]);
  const touched={bp:true,pulse:true,temp:true};
  const alerts = computeAlerts({bp:p.bp,pulse:p.pulse,tempVal:p.temp,tempUnit:p.tempUnit||'F'},touched);
  let h = `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:9px;font-family:var(--fn)">← ${t('Cola','Queue')}</button>`;
  if (alerts.length) alerts.forEach(a=>{h+=`<div class="alert-box ${a.level==='alert'?'alert-rd':'alert-am'}"><span style="font-size:15px">${a.level==='alert'?'🚨':'⚠️'}</span><div>${a.msg}</div></div>`;});
  h += `<div class="card cp">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <div><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
      <span style="font-size:10px;color:var(--g6)">${p.vitalsAt||p.createdAt}</span>
    </div>
    <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
    <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.gender==='M'?t('Masc','Male'):t('Fem','Female')}${p.phone?' · 📞 '+p.phone:''}</div>
    <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
    ${actS.length?`<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
      ${actS.map(s=>`<span style="background:var(--rdl);color:var(--rd);border-radius:20px;padding:2px 8px;font-size:10px;font-weight:500">${SYM_ICO[s]} ${SYM_LBL[S.lang][s]}</span>`).join('')}
    </div>`:''}
  </div>`;
  if (p.bp) {
    const bpParsed = parseBP(p.bp);
    h += `<div class="vg">
      ${p.bp?`<div class="vi ${vitalStatus('systolic',bpParsed.sys)!=='ok'?'vi-warn':'vi-ok'}"><div class="vl">BP</div><div class="vv">${p.bp}</div></div>`:''}
      ${p.pulse?`<div class="vi ${vitalStatus('pulse',p.pulse)!=='ok'?'vi-warn':'vi-ok'}"><div class="vl">${t('Pulso','Pulse')}</div><div class="vv">${p.pulse}bpm</div></div>`:''}
      ${p.weightKg?`<div class="vi vi-ok"><div class="vl">${t('Peso','Weight')}</div><div class="vv">${p.weightKg}kg</div></div>`:''}
      ${p.temp?`<div class="vi ${vitalStatus(p.tempUnit==='F'?'temp_f':'temp_c',p.temp)!=='ok'?'vi-warn':'vi-ok'}"><div class="vl">Temp</div><div class="vv">${p.temp}°${p.tempUnit||'F'}</div></div>`:''}
    </div>`;
  }
  const activeConds = CONDS.filter(c=>p.conditions?.[c]);
  if (activeConds.length) h += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
    ${activeConds.map(c=>`<span style="background:var(--aml);color:var(--am);border-radius:20px;padding:2px 8px;font-size:10px;font-weight:500">🩺 ${COND_LBL[S.lang][c]}</span>`).join('')}
  </div>`;
  h += `<div class="fld"><label>${t('Diagnóstico','Diagnosis')}</label><input id="dx" value="${rec.diagnostico||''}" placeholder="${t('Ej: Faringoamigdalitis','E.g. Acute pharyngitis')}"/></div>
  <div class="fld"><label>${t('Notas','Notes')}</label><textarea id="dn" placeholder="${t('Notas...','Notes...')}">${rec.notas||''}</textarea></div>
  <div class="r2">
    <div class="fld"><label>👨‍⚕️ ${t('Médico (iniciales)','Doctor (initials)')}</label><input id="dr" value="${rec.medico||''}" placeholder="Dr. JG"/></div>
    <div class="fld" style="display:flex;align-items:flex-end;padding-bottom:2px">
      <label style="display:flex;align-items:center;gap:6px;font-size:11px;cursor:pointer">
        <input type="checkbox" id="seg" ${rec.seguimiento?'checked':''} style="width:15px;height:15px">
        ${t('Requiere seguimiento','Needs follow-up')}
      </label>
    </div>
  </div>
  <div style="font-size:12px;font-weight:600;margin-bottom:8px">💊 ${t('Receta','Prescription')}</div>
  <div style="background:var(--g1);border-radius:8px;overflow:hidden;margin-bottom:11px">
    <div style="display:flex;padding:5px 10px;border-bottom:1px solid var(--g2);font-size:9px;color:var(--g6);font-weight:600;text-transform:uppercase">
      <span style="flex:1">${t('Medicamento','Medication')}</span><span style="width:50px;text-align:center">${t('Cant.','Qty')}</span><span style="width:50px;text-align:right">Stock</span>
    </div>
    ${S.meds.map(m=>{const cur=S.inventory[m.id]||0;const qty=S.docRx[m.id]||0;const after=Math.max(0,cur-qty);
      let cls='stock-ok',icon='';if(cur===0){cls='stock-zero';icon=' ✕';}else if(cur<5){cls='stock-low';icon=' ⚠';}
      return`<div class="med-rx-row"><div class="med-rx-name">${m.n}</div>
        <input type="number" min="0" max="${cur}" value="${qty||''}" placeholder="0"
          oninput="S.docRx['${m.id}']=parseInt(this.value)||0"
          style="width:46px;padding:4px 5px;border:1.5px solid var(--g2);border-radius:5px;font-size:12px;text-align:center;background:${qty>0?'#f0eeff':'var(--w)'}"/>
        <div style="font-size:10px;width:50px;text-align:right;font-family:var(--mo)">
          <div class="${cls}">${cur}${icon}</div>
          ${qty>0?`<div class="stock-after" style="color:${after<3?'var(--rd)':'var(--g6)'}">→${after}</div>`:''}
        </div>
      </div>`;}).join('')}
  </div>
  <button class="btn bp" onclick="sendRx('${p.id}')">${t('Enviar receta →','Send prescription →')}</button>`;
  return h;
}
function selDoc(id) {
  const p = S.patients.find(x=>x.id===id);
  S.docRx = Object.fromEntries((p.doctor?.prescription||[]).map(r=>[r.medId,r.qty]));
  S.patients = S.patients.map(x=>x.id===id?{...x,status:x.status==='waiting'?'attending':x.status}:x);
  set({selPatient:{...p}});
}
function sendRx(id) {
  const dx = document.getElementById('dx')?.value;
  if (!dx) { toast('⚠ ' + t('Diagnóstico requerido','Diagnosis required')); return; }
  const rx = Object.entries(S.docRx).filter(([,q])=>q>0).map(([mid,qty])=>({medId:mid,qty,name:S.meds.find(m=>m.id===mid)?.n}));
  S.patients = S.patients.map(p=>p.id!==id?p:{...p,status:'prescribed',
    doctor:{...p.doctor,diagnostico:dx,notas:document.getElementById('dn')?.value||'',
      medico:document.getElementById('dr')?.value||'',
      seguimiento:document.getElementById('seg')?.checked||false,
      prescription:rx,prescribedAt:tnow(),
      operadorDoctor:S.stationOperator||S.currentOperator||''},deliveryChecked:[]});
  const rxPat = S.patients.find(x=>x.id===id);
  if (typeof syncPatient==='function') syncPatient(rxPat);
  if (SHEETS_URL && !SHEETS_URL.includes('REEMPLAZA')) {
    fetch(SHEETS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'update_patient',data:rxPat})}).catch(()=>{});
  }
  toast('✓ ' + t('Receta enviada · 🔥 Sync','Prescription sent · 🔥 Sync'));
  set({selPatient:null}); S.docRx = {};
}

// ── DENTAL ────────────────────────────────────────────────────────────────
function renderDental() {
  if (S.selPatient) {
    const p=S.selPatient, d=p.dental||{};
    return `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:9px;font-family:var(--fn)">← ${t('Cola','Queue')}</button>
    <div class="card cbl">
      <div style="margin-bottom:6px"><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
      <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.aldeaPaciente||'—'}</div>
    </div>
    <div class="stl">🦷 ${t('Atención Dental','Dental Care')}</div>
    <div class="r3">
      <div class="fld"><label>🦷 ${t('Rellenos','Fillings')}</label><input type="number" id="d-rel" value="${d.rellenos||0}" min="0"/></div>
      <div class="fld"><label>🔧 ${t('Extracciones','Extractions')}</label><input type="number" id="d-ext" value="${d.extracciones||0}" min="0"/></div>
      <div class="fld"><label>☢️ Rayos X</label><select id="d-rx"><option value="0" ${!d.rayosX?'selected':''}>No</option><option value="1" ${d.rayosX?'selected':''}>${t('Sí','Yes')}</option></select></div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;padding:10px 12px;border:1.5px solid ${d.tratEspecial?'var(--blue)':'var(--g2)'};border-radius:8px;cursor:pointer;background:${d.tratEspecial?'var(--bluel)':'var(--w)'};margin-bottom:11px">
      <input type="checkbox" id="d-trat" ${d.tratEspecial?'checked':''} style="width:16px;height:16px;accent-color:var(--blue)">
      <div><div style="font-size:12px;font-weight:500;color:${d.tratEspecial?'var(--blue)':'var(--g9)'}">🏥 ${t('Tratamiento Clínica El Faro','Treatment at El Faro Clinic')}</div>
      <div style="font-size:10px;color:var(--g6)">${t('Requiere cita en clínica','Requires clinic appointment')}</div></div>
    </label>
    <div class="fld"><label>👨‍⚕️ ${t('Médico (iniciales)','Doctor (initials)')}</label><input id="d-dr" value="${d.medico||''}" placeholder="Dr. JG"/></div>
    <div class="fld"><label>${t('Notas','Notes')}</label><textarea id="d-not" placeholder="${t('Observaciones...','Observations...')}">${d.notas||''}</textarea></div>
    <button class="btn bbl" onclick="saveDental('${p.id}')">✓ ${t('Guardar dental','Save dental')}</button>`;
  }
  const queue = S.patients.filter(p=>p.date===S.actDate&&(p.areas||[]).includes('dental'));
  let h = `<div class="stl">🦷 Dental (${queue.length})</div>`;
  if (!queue.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">🦷</div>${t('Sin pacientes','No patients')}</div>`;
  else queue.forEach(p=>{const d=p.dental||{};
    h += `<div class="qi" onclick="set({selPatient:{...S.patients.find(x=>x.id==='${p.id}')}})">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.age}a · ${d.rellenos||0}R ${d.extracciones||0}E${d.tratEspecial?' · 🏥':''}</div></div>
      <span class="stbdg ${d.medico?'sd2':'sw'}">${d.medico?'✓':'Pend.'}</span>
    </div>`;});
  return h;
}
function saveDental(id) {
  S.patients = S.patients.map(p=>p.id!==id?p:{...p,dental:{
    rellenos:parseInt(document.getElementById('d-rel')?.value)||0,
    extracciones:parseInt(document.getElementById('d-ext')?.value)||0,
    rayosX:document.getElementById('d-rx')?.value==='1',
    tratEspecial:document.getElementById('d-trat')?.checked||false,
    medico:document.getElementById('d-dr')?.value||'',
    notas:document.getElementById('d-not')?.value||'',
  }});
  if (typeof syncPatient==='function') syncPatient(S.patients.find(x=>x.id===id));
  toast('✓ ' + t('Dental guardado','Dental saved')); set({selPatient:null});
}

// ── OJOS ──────────────────────────────────────────────────────────────────
function renderOjos() {
  if (S.selPatient) {
    const p=S.selPatient, o=p.ojos||{};
    return `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:9px;font-family:var(--fn)">← ${t('Cola','Queue')}</button>
    <div class="card ctl2">
      <div style="margin-bottom:6px"><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
      <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.age}a · ${p.aldeaPaciente||'—'}</div>
    </div>
    <div class="stl">👁 ${t('Ojos / Optometría','Eyes / Optometry')}</div>
    ${[{id:'antLectura',icon:'👓',es:'Anteojos de lectura',en:'Reading glasses'},
       {id:'antSol',icon:'🕶️',es:'Anteojos de sol',en:'Sunglasses'},
       {id:'colirio',icon:'💧',es:'Necesita colirio',en:'Needs eye drops'}].map(it=>`
    <label style="display:flex;align-items:center;gap:8px;padding:9px 11px;border:1.5px solid ${o[it.id]?'var(--teal2)':'var(--g2)'};border-radius:8px;cursor:pointer;background:${o[it.id]?'var(--teal2l)':'var(--w)'};margin-bottom:7px">
      <input type="checkbox" id="o-${it.id}" ${o[it.id]?'checked':''} style="width:16px;height:16px;accent-color:var(--teal2)">
      <span style="font-size:12px">${it.icon} ${S.lang==='es'?it.es:it.en}</span>
    </label>`).join('')}
    <label style="display:flex;align-items:center;gap:8px;padding:9px 11px;border:1.5px solid ${o.cirugia?'var(--sp)':'var(--g2)'};border-radius:8px;cursor:pointer;background:${o.cirugia?'var(--spl)':'var(--w)'};margin-bottom:11px">
      <input type="checkbox" id="o-cirugia" ${o.cirugia?'checked':''} style="width:16px;height:16px;accent-color:var(--sp)">
      <div><div style="font-size:12px;font-weight:500;color:${o.cirugia?'var(--sp)':'var(--g9)'}">🔬 ${t('Candidato para cirugía','Surgery candidate')}</div>
      <div style="font-size:10px;color:var(--g6)">${t('Se notificará para contacto futuro','Will be contacted in the future')}</div></div>
    </label>
    <div class="fld"><label>👨‍⚕️ ${t('Médico (iniciales)','Doctor (initials)')}</label><input id="o-dr" value="${o.medico||''}" placeholder="Dr. JG"/></div>
    <div class="fld"><label>${t('Notas','Notes')}</label><textarea id="o-not" placeholder="${t('Observaciones...','Observations...')}">${o.notas||''}</textarea></div>
    <button class="btn btl2" onclick="saveOjos('${p.id}')">✓ ${t('Guardar ojos','Save eyes')}</button>`;
  }
  const queue = S.patients.filter(p=>p.date===S.actDate&&(p.areas||[]).includes('ojos'));
  let h = `<div class="stl">👁 ${t('Ojos','Eyes')} (${queue.length})</div>`;
  if (!queue.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">👁</div>${t('Sin pacientes','No patients')}</div>`;
  else queue.forEach(p=>{const o=p.ojos||{};
    h += `<div class="qi" onclick="set({selPatient:{...S.patients.find(x=>x.id==='${p.id}')}})">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.age}a${o.cirugia?' · 🔬':''} ${o.antLectura?'👓':''} ${o.colirio?'💧':''}</div></div>
      <span class="stbdg ${o.medico?'sd2':'sw'}">${o.medico?'✓':'Pend.'}</span>
    </div>`;});
  return h;
}
function saveOjos(id) {
  S.patients = S.patients.map(p=>p.id!==id?p:{...p,ojos:{
    antLectura:document.getElementById('o-antLectura')?.checked||false,
    antSol:document.getElementById('o-antSol')?.checked||false,
    colirio:document.getElementById('o-colirio')?.checked||false,
    cirugia:document.getElementById('o-cirugia')?.checked||false,
    medico:document.getElementById('o-dr')?.value||'',
    notas:document.getElementById('o-not')?.value||'',
  }});
  if (typeof syncPatient==='function') syncPatient(S.patients.find(x=>x.id===id));
  toast('✓ ' + t('Ojos guardado','Eyes saved')); set({selPatient:null});
}

// ── FARMACIA ──────────────────────────────────────────────────────────────
function renderFarmacia() {
  if (S.selPatient) {
    const p=S.selPatient, rx=p.doctor||{};
    const checked=p.deliveryChecked||[];
    const allIds=(rx.prescription||[]).map(r=>r.medId);
    const allChk=allIds.length>0&&allIds.every(id=>checked.includes(id));
    let h = `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:9px;font-family:var(--fn)">← ${t('Pendientes','Pending')}</button>
    <div class="card ca">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
        <span style="font-size:10px;color:var(--g6)">${rx.prescribedAt||''}</span>
      </div>
      <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
      ${rx.diagnostico?`<div style="margin-top:5px;font-size:11px;color:var(--pu);font-weight:500">Dx: ${rx.diagnostico}</div>`:''}
      ${rx.seguimiento?`<div style="margin-top:5px;font-size:10px;background:var(--aml);color:var(--am);padding:3px 8px;border-radius:20px;display:inline-block">⚠ ${t('Requiere seguimiento','Needs follow-up')}</div>`:''}
    </div>`;
    if (!rx.prescription?.length) h += `<div style="font-size:11px;color:var(--g6);padding:8px 0">${t('Sin medicamentos recetados','No medications prescribed')}</div>`;
    else {
      h += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:12px;font-weight:600">💊 ${t('Receta','Prescription')} — ${checked.length}/${allIds.length}</div>
        ${!allChk?`<button type="button" onclick="checkAllFarm('${p.id}')" style="font-size:10px;padding:4px 10px;border-radius:20px;background:var(--tll);color:var(--tl);border:1px solid var(--tl);cursor:pointer;font-family:var(--fn);font-weight:500">${t('Marcar todos','Check all')}</button>`:''}
      </div>`;
      rx.prescription.forEach(item=>{
        const isChk=checked.includes(item.medId);
        const stock=S.inventory[item.medId]||0, after=Math.max(0,stock-item.qty);
        const med=S.meds.find(m=>m.id===item.medId);
        h += `<div class="farm-item ${isChk?'checked':''}" onclick="toggleFarmItem('${p.id}','${item.medId}')">
          <div class="farm-chk ${isChk?'checked':''}">${isChk?'✓':''}</div>
          <div class="farm-item-info">
            <div style="font-size:12px;font-weight:500">${item.name}</div>
            <div style="font-size:11px;color:var(--g6);margin-top:2px">${item.qty} ${med?.u||'u'} · ${isChk?`<span style="color:var(--gn);font-weight:500">✓ ${t('Entregado','Delivered')}</span>`:`<span>${t('Pendiente','Pending')}</span>`}</div>
          </div>
          <div style="font-size:10px;font-family:var(--mo);text-align:right">
            <div style="font-weight:600;color:${stock<5?'var(--rd)':'var(--g9)'}">${stock}</div>
            <div style="font-size:9px;color:${after<3?'var(--rd)':'var(--g6)'}">→${after}</div>
          </div>
        </div>`;
      });
      if (checked.length>0) h += `<div style="background:var(--gnl);border-radius:8px;padding:8px 10px;margin-bottom:10px;font-size:11px;color:var(--gn);font-weight:500">
        📦 ${t('Quedarán','Will remain')}: ${rx.prescription.filter(r=>checked.includes(r.medId)).map(r=>`${r.name?.split(' ').pop()}: ${Math.max(0,(S.inventory[r.medId]||0)-r.qty)}`).join(' · ')}
      </div>`;
    }
    if (rx.notas) h += `<div style="font-size:11px;color:var(--g6);background:var(--g1);border-radius:8px;padding:10px;margin:9px 0">${rx.notas}</div>`;
    const canCfm = checked.length>0&&p.status!=='delivered';
    h += `<button class="btn ${canCfm?'btn-gn':'bg'}" onclick="${canCfm?`confirmDelivery('${p.id}')`:''}" style="opacity:${canCfm?1:0.5}">
      ✓ ${t('Confirmar entrega completa','Confirm complete delivery')}
    </button>`;
    return h;
  }
  const pend  = S.patients.filter(p=>p.status==='prescribed');
  const deliv = S.patients.filter(p=>p.status==='delivered');
  let h = `<div class="stl">🟠 ${t('Recetas pendientes','Pending prescriptions')} (${pend.length})</div>`;
  if (!pend.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">💊</div>${t('Sin recetas pendientes','No pending prescriptions')}</div>`;
  else pend.forEach(p=>{
    const chk=(p.deliveryChecked||[]).length, tot=(p.doctor?.prescription||[]).length;
    h += `<div class="qi" onclick="set({selPatient:{...S.patients.find(x=>x.id==='${p.id}')}})">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}${p.doctor?.seguimiento?' ⚠':''}</div>
        <div style="font-size:10px;color:var(--g6)">${p.doctor?.diagnostico||''} · ${tot} med · ${chk}/${tot} ✓</div>
        <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
      </div>
      <span class="stbdg spr">→</span>
    </div>`;
  });
  const modMeds = S.meds.filter(m=>(S.inventory[m.id]||0)<(S.initInventory[m.id]||0));
  if (modMeds.length) h += `<div style="background:var(--g1);border-radius:9px;padding:10px 12px;margin-top:12px;margin-bottom:10px">
    <div style="font-size:11px;font-weight:600;margin-bottom:7px;color:var(--g6)">📦 ${t('Balance actual','Current balance')}</div>
    ${modMeds.map(m=>{const cur=S.inventory[m.id]||0,init=S.initInventory[m.id]||1,pct=Math.round(cur/init*100);
      return`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--g2);font-size:10px">
        <div style="flex:1;color:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g9)'}">${m.n}${cur===0?' ✕':cur<5?' ⚠':''}</div>
        <div style="width:50px;height:6px;background:var(--g2);border-radius:3px;overflow:hidden"><div style="height:100%;border-radius:3px;width:${pct}%;background:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--gn)'}"></div></div>
        <div style="font-family:var(--mo);font-weight:600;min-width:20px;text-align:right;color:${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g9)'}">${cur}</div>
      </div>`;}).join('')}
  </div>`;
  if (deliv.length) {
    h += `<div class="stl" style="margin-top:6px;color:var(--g6)">✅ ${t('Entregados','Delivered')} (${deliv.length})</div>`;
    deliv.forEach(p=>{h += `<div class="qi" style="opacity:.65">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--g6)">${p.deliveredAt||''}</div></div>
      <span class="stbdg sd2">✓</span>
    </div>`;});
  }
  return h;
}
function toggleFarmItem(patId,medId) {
  S.patients = S.patients.map(p=>{if(p.id!==patId)return p;const chk=p.deliveryChecked||[];return{...p,deliveryChecked:chk.includes(medId)?chk.filter(x=>x!==medId):[...chk,medId]};});
  set({selPatient:{...S.patients.find(x=>x.id===patId)}});
}
function checkAllFarm(patId) {
  S.patients = S.patients.map(p=>p.id!==patId?p:{...p,deliveryChecked:(p.doctor?.prescription||[]).map(rx=>rx.medId)});
  set({selPatient:{...S.patients.find(x=>x.id===patId)}});
}
function confirmDelivery(patId) {
  const p = S.patients.find(x=>x.id===patId); if(!p) return;
  const checked = p.deliveryChecked||[]; if(!checked.length){toast('⚠ '+t('Marca al menos uno','Check at least one'));return;}
  const newInv = {...S.inventory};
  (p.doctor?.prescription||[]).forEach(rx=>{if(checked.includes(rx.medId))newInv[rx.medId]=Math.max(0,(newInv[rx.medId]||0)-rx.qty);});
  S.inventory = newInv;
  const hist=[...(p.deliveryHistory||[]),{at:tnow(),meds:(p.doctor?.prescription||[]).filter(rx=>checked.includes(rx.medId)).map(rx=>({name:rx.name,qty:rx.qty,u:S.meds.find(m=>m.id===rx.medId)?.u||'u'}))}];
  S.patients = S.patients.map(x=>x.id===patId?{...x,status:'delivered',deliveredAt:tnow(),deliveryChecked:checked,deliveryHistory:hist,operadorFarmacia:S.stationOperator||S.currentOperator||''}:x);
  const confirmedPat = S.patients.find(x=>x.id===patId);
  if (typeof syncPatient==='function') syncPatient(confirmedPat);
  if (typeof syncInventory==='function') syncInventory(S.inventory,S.meds,S.initInventory);
  // Auto-send delivery + inventory to Google Sheets
  if (SHEETS_URL && !SHEETS_URL.includes('REEMPLAZA')) {
    const delivHist = confirmedPat?.deliveryHistory||[];
    const lastDeliv = delivHist[delivHist.length-1];
    if (lastDeliv) fetch(SHEETS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'dispensed',data:{patient:confirmedPat,delivery:lastDeliv,deliveryNum:delivHist.length}})}).catch(()=>{});
    const invData = S.meds.map(m=>({name:m.n,unit:m.u,initial:S.initInventory[m.id]||0,current:S.inventory[m.id]||0}));
    fetch(SHEETS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'inventory_update',data:{meds:invData}})}).catch(()=>{});
  }
  // Push full state so inventory updates on ALL devices instantly
  pushFB();
  toast('✓ '+t('Entrega confirmada · 🔥 Sync','Delivery confirmed · 🔥 Sync'));
  set({selPatient:null});
}

// ── ESPIRITUAL ─────────────────────────────────────────────────────────────
function renderEspiritual() {
  if (S.selPatient) {
    const p=S.selPatient, sp=p.spiritual||{};
    const items=[{k:'prayed',i:'🙏',es:'Hizo la oración',en:'Prayed'},{k:'accepted',i:'✝️',es:'Aceptó a Cristo',en:'Accepted Christ'},{k:'reconciled',i:'🕊️',es:'Se reconcilió',en:'Reconciled'},{k:'interested',i:'📞',es:'Interesado en contacto',en:'Interested in contact'}];
    return `<button onclick="set({selPatient:null})" style="font-size:11px;color:var(--g6);background:none;border:none;cursor:pointer;padding:0;margin-bottom:9px;font-family:var(--fn)">← ${t('Volver','Back')}</button>
    <div class="card csp">
      <div style="margin-bottom:6px"><div class="pnum-day">#${p.dayNum}</div><div class="pnum-code">${p.code}</div></div>
      <div style="font-size:13px;font-weight:600">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'}</div>
    </div>
    <div style="margin-bottom:11px">${items.map(it=>`<button type="button" class="schk ${sp[it.k]?'on':''}" onclick="togSpirit('${p.id}','${it.k}')">
      <span style="font-size:16px">${sp[it.k]?'☑':'☐'}</span>
      <div style="font-size:12px">${it.i} ${S.lang==='es'?it.es:it.en}</div>
    </button>`).join('')}</div>
    <div class="fld"><label>📝 ${t('Notas pastorales','Pastoral notes')}</label><textarea oninput="updSN('${p.id}',this.value)" placeholder="...">${sp.notes||''}</textarea></div>
    <button class="btn bsp" onclick="saveSpirit('${p.id}')">${t('Guardar info espiritual','Save spiritual info')}</button>`;
  }
  let h = `<div class="stl">✝️ ${t('Clínica Espiritual','Spiritual Clinic')}</div>`;
  if (!S.patients.length) h += `<div class="empty"><div style="font-size:28px;margin-bottom:8px">✝️</div>${t('Sin pacientes','No patients')}</div>`;
  else S.patients.forEach(p=>{
    const sp=p.spiritual||{};
    const fl=[sp.prayed?'🙏':'',sp.accepted?'✝️':'',sp.reconciled?'🕊️':'',sp.interested?'📞':''].filter(Boolean).join(' ');
    h += `<div class="qi" onclick="set({selPatient:{...S.patients.find(x=>x.id==='${p.id}')}})">
      <div class="qnum">#${p.dayNum}</div>
      <div style="flex:1"><div style="font-size:12px;font-weight:500">${p.nombre} ${p.apellido}</div>
      <div style="font-size:10px;color:var(--tl)">📍 ${p.aldeaPaciente||'—'} ${fl||''}</div></div>
      <span style="font-size:15px">${fl?'✅':'○'}</span>
    </div>`;
  });
  return h;
}
function togSpirit(pid,key){S.patients=S.patients.map(p=>{if(p.id!==pid)return p;const sp={...p.spiritual};sp[key]=!sp[key];return{...p,spiritual:sp};});set({selPatient:{...S.patients.find(x=>x.id===pid)}});}
function updSN(pid,v){S.patients=S.patients.map(p=>p.id!==pid?p:{...p,spiritual:{...p.spiritual,notes:v}});}
function saveSpirit(pid){
  S.patients = S.patients.map(p=>p.id!==pid?p:{...p,operadorEspiritual:S.stationOperator||S.currentOperator||''});
  const sp = S.patients.find(x=>x.id===pid);
  if(typeof syncPatient==='function') syncPatient(sp);
  // Auto-send spiritual to Google Sheets
  if (SHEETS_URL && !SHEETS_URL.includes('REEMPLAZA')) {
    fetch(SHEETS_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({type:'spiritual_update',data:sp})}).catch(()=>{});
  }
  toast('✓ '+t('Espiritual guardado · 🔥 Sync','Spiritual saved · 🔥 Sync'));set({selPatient:null});
}

// ── ADMIN ──────────────────────────────────────────────────────────────────
function renderAdmin() {
  const tab=S.adminTab;
  let h = `<div class="tabs">
    <button class="tab ${tab==='stats'?'on':''}" onclick="set({adminTab:'stats'})">📊 Stats</button>
    <button class="tab ${tab==='inv'?'on':''}" onclick="set({adminTab:'inv'})">📦 ${t('Inv.','Inv.')}</button>
    <button class="tab ${tab==='alds'?'on':''}" onclick="set({adminTab:'alds'})">📍 ${t('Aldeas','Villages')}</button>
    <button class="tab ${tab==='users'?'on':''}" onclick="set({adminTab:'users'})">👤 ${t('Usuarios','Users')}</button>
    <button class="tab ${tab==='export'?'on':''}" onclick="set({adminTab:'export'})">↑ Sync</button>
  </div>`;
  if(tab==='stats') h+=renderStats();
  else if(tab==='inv') h+=renderInv();
  else if(tab==='alds') h+=renderAldeas();
  else if(tab==='users') h+=renderUsers();
  else h+=renderExport();
  return h;
}

function renderStats() {
  const pts=S.patients, total=pts.length;
  if (!total) return `<div class="empty"><div style="font-size:28px;margin-bottom:8px">📊</div>${t('Sin pacientes','No patients')}</div>`;
  const males=pts.filter(p=>p.gender==='M').length, females=pts.filter(p=>p.gender==='F').length;
  const deliv=pts.filter(p=>p.status==='delivered').length, wait=pts.filter(p=>p.status==='waiting'||p.status==='attending').length, presc=pts.filter(p=>p.status==='prescribed').length;
  const agG=[{l:'0-12',mn:0,mx:12},{l:'13-17',mn:13,mx:17},{l:'18-35',mn:18,mx:35},{l:'36-59',mn:36,mx:59},{l:'60+',mn:60,mx:200}];
  const agC=agG.map(g=>({l:g.l,c:pts.filter(p=>{const a=parseInt(p.age)||0;return a>=g.mn&&a<=g.mx;}).length}));
  const areaStats=AREAS.map(a=>({...a,count:pts.filter(p=>(p.areas||[]).includes(a.id)).length})).filter(a=>a.count>0);
  const mxA=Math.max(1,...areaStats.map(a=>a.count));
  const drMap={};pts.forEach(p=>{const dr=(p.doctor?.medico||'').trim();if(dr)drMap[dr]=(drMap[dr]||0)+1;});
  const drStats=Object.entries(drMap).sort((a,b)=>b[1]-a[1]);
  const symStats=SYMS.map(s=>({i:SYM_ICO[s],l:SYM_LBL[S.lang][s],c:pts.filter(p=>p.symptoms?.[s]).length})).filter(s=>s.c>0).sort((a,b)=>b.c-a.c);
  const mxS=Math.max(1,...symStats.map(s=>s.c));
  const dxMap={};pts.forEach(p=>{const dx=(p.doctor?.diagnostico||'').trim().toLowerCase();if(dx)dxMap[dx]=(dxMap[dx]||0)+1;});
  const dxStats=Object.entries(dxMap).map(([k,v])=>({label:k,count:v})).sort((a,b)=>b.count-a.count);
  const maxDx=dxStats.length?dxStats[0].count:1, dxTotal=dxStats.reduce((s,d)=>s+d.count,0);
  const sp_p=pts.filter(p=>p.spiritual?.prayed).length, sp_a=pts.filter(p=>p.spiritual?.accepted).length;
  const sp_r=pts.filter(p=>p.spiritual?.reconciled).length, sp_i=pts.filter(p=>p.spiritual?.interested).length;
  const denPts=pts.filter(p=>(p.areas||[]).includes('dental'));
  const ojosPts=pts.filter(p=>(p.areas||[]).includes('ojos'));
  const villages=[...new Set(pts.map(p=>p.aldeaPaciente||p.location||'—'))];
  const mxV=Math.max(1,...villages.map(v=>pts.filter(p=>(p.aldeaPaciente||p.location)===v).length));
  const cols=['#0d7a5f','#5b4fcf','#c47f17','#c0392b','#1a6fa8'];
  const Bar=(lbl,cnt,mx,col)=>`<div class="br"><div style="font-size:10px;color:var(--g6);min-width:90px;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${lbl}</div><div class="btr"><div class="bf2" style="width:${mx?Math.round(cnt/mx*100):0}%;background:${col}"></div></div><div style="font-size:10px;font-weight:600;min-width:22px;text-align:right;font-family:var(--mo)">${cnt}</div></div>`;
  return `
  <div class="sbox"><div class="sbox-title">👥 ${t('Pacientes del día','Patients today')}</div>
    <div class="sgrid">${[{l:'Total',v:total,c:'var(--tl)'},{l:t('Entregados','Delivered'),v:deliv,c:'var(--gn)'},{l:t('En espera','Waiting'),v:wait,c:'#e65100'},{l:t('Con receta','Prescribed'),v:presc,c:'var(--pu)'}].map(s=>`<div class="sc"><div style="font-size:9px;color:var(--g6);margin-bottom:2px">${s.l}</div><div style="font-size:20px;font-weight:600;font-family:var(--mo);color:${s.c}">${s.v}</div></div>`).join('')}</div>
    <div style="display:flex;gap:8px;margin-top:4px;margin-bottom:10px">${[{l:t('Masc','Male'),c:males,col:'#1a6fa8'},{l:t('Fem','Female'),c:females,col:'#c47f17'}].map(g=>`<div style="flex:1;background:var(--w);border-radius:7px;padding:8px 10px;text-align:center;border:1px solid var(--g2)"><div style="font-size:9px;color:var(--g6);margin-bottom:2px">${g.l}</div><div style="font-size:20px;font-weight:600;font-family:var(--mo);color:${g.col}">${g.c}</div><div style="font-size:9px;color:var(--g6)">${total?Math.round(g.c/total*100):0}%</div></div>`).join('')}</div>
    <div style="font-size:11px;font-weight:600;margin-bottom:8px">🎂 ${t('Por edad','By age')}</div>
    ${agC.map((g,i)=>Bar(g.l,g.c,Math.max(1,total),cols[i%cols.length])).join('')}
    ${villages.length>1?`<div style="font-size:11px;font-weight:600;margin-bottom:8px;margin-top:10px">📍 ${t('Por aldea','By village')}</div>${villages.map((v,i)=>Bar(v,pts.filter(p=>(p.aldeaPaciente||p.location)===v).length,mxV,cols[i%cols.length])).join('')}`:''}
  </div>
  <div class="sbox"><div class="sbox-title">🏥 ${t('Áreas de atención','Areas of care')}</div>
    ${areaStats.map((a,i)=>Bar(`${a.icon} ${a.id==='otro'&&S.especialidadDelDia?S.especialidadDelDia:a.label}`,a.count,mxA,cols[i%cols.length])).join('')||`<div style="font-size:11px;color:var(--g6)">${t('Sin datos','No data')}</div>`}
  </div>
  ${drStats.length?`<div class="sbox"><div class="sbox-title">👨‍⚕️ ${t('Pacientes por médico','Patients by doctor')}</div>
    ${drStats.map((d,i)=>Bar(d[0],d[1],Math.max(1,...drStats.map(x=>x[1])),cols[i%cols.length])).join('')}
  </div>`:''}
  <div class="sbox"><div class="sbox-title">🩺 ${t('Diagnósticos','Diagnoses')}</div>
    ${!dxStats.length?`<div style="font-size:11px;color:var(--g6);font-style:italic">${t('Sin diagnósticos','No diagnoses')}</div>`:dxStats.slice(0,8).map((dx,i)=>`<div class="dx-row">
      <div style="font-family:var(--mo);font-size:10px;color:var(--g4);min-width:16px">${i+1}</div>
      <div class="dx-label">${dx.label}</div>
      <div style="width:56px;flex-shrink:0"><div style="height:7px;background:var(--g2);border-radius:4px;overflow:hidden"><div style="height:100%;border-radius:4px;width:${Math.round(dx.count/maxDx*100)}%;background:${DX_COLORS[i%DX_COLORS.length]}"></div></div></div>
      <div style="min-width:30px;text-align:right"><div style="font-family:var(--mo);font-size:11px;font-weight:600;color:var(--pu)">${dx.count}</div><div style="font-size:9px;color:var(--g6)">${dxTotal?Math.round(dx.count/dxTotal*100):0}%</div></div>
    </div>`).join('')}
  </div>
  ${symStats.length?`<div class="sbox"><div class="sbox-title">🤒 ${t('Síntomas','Symptoms')}</div>${symStats.map(s=>Bar(`${s.i} ${s.l}`,s.c,mxS,'var(--rd)')).join('')}</div>`:''}
  <div class="sbox"><div class="sbox-title">🦷 Dental · 👁 ${t('Ojos','Eyes')}</div>
    <div class="sgrid">${[
      {l:'Dental',v:denPts.length,c:'var(--blue)'},
      {l:t('Rellenos','Fillings'),v:denPts.reduce((s,p)=>s+(parseInt(p.dental?.rellenos)||0),0),c:'var(--blue)'},
      {l:t('Ojos','Eyes'),v:ojosPts.length,c:'var(--teal2)'},
      {l:t('Candidatos Cx','Surgery Cand.'),v:ojosPts.filter(p=>p.ojos?.cirugia).length,c:'var(--sp)'}
    ].map(s=>`<div class="sc"><div style="font-size:9px;color:var(--g6);margin-bottom:2px">${s.l}</div><div style="font-size:20px;font-weight:600;font-family:var(--mo);color:${s.c}">${s.v}</div></div>`).join('')}</div>
  </div>
  <div class="sbox"><div class="sbox-title">✝️ ${t('Clínica Espiritual','Spiritual Clinic')}</div>
    ${[{i:'🙏',es:'Hizo la oración',en:'Prayed',v:sp_p},{i:'✝️',es:'Aceptó a Cristo',en:'Accepted Christ',v:sp_a},{i:'🕊️',es:'Se reconcilió',en:'Reconciled',v:sp_r},{i:'📞',es:'Interesado contacto',en:'Interested contact',v:sp_i}].map(it=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--g2);font-size:11px"><span>${it.i} ${S.lang==='es'?it.es:it.en}</span><span style="font-family:var(--mo);font-size:17px;font-weight:600;color:var(--sp)">${it.v}</span></div>`).join('')}
  </div>`;
}

function renderInv() {
  let h = `<div class="stl">📦 ${t('Inventario','Inventory')}</div>
  <div style="background:var(--g1);border-radius:9px;padding:4px 0 4px 8px;margin-bottom:10px">
    ${S.meds.map(m=>{const cur=S.inventory[m.id]||0,init=S.initInventory[m.id]||0,used=init-cur,isCustom=m.id.startsWith('mx_');
    return`<div class="inv-r">
      <div style="flex:1"><div style="font-size:11px">${m.n}<span style="font-size:9px;color:var(--g4);margin-left:4px">(${m.u})</span></div>${used>0?`<div style="font-size:9px;color:var(--am)">−${used} ${t('entregados','dispensed')}</div>`:''}</div>
      <div style="display:flex;align-items:center;gap:4px">
        <button type="button" onclick="S.inventory['${m.id}']=Math.max(0,(S.inventory['${m.id}']||0)-1);render()" style="width:24px;height:24px;border:1.5px solid var(--g2);border-radius:6px;background:var(--w);font-size:15px;cursor:pointer;color:var(--g6)">−</button>
        <input type="number" value="${cur}" oninput="S.inventory['${m.id}']=Math.max(0,parseInt(this.value)||0)" style="width:44px;padding:4px;border:1.5px solid ${cur===0?'var(--rd)':cur<5?'var(--am)':'var(--g2)'};border-radius:6px;font-size:13px;text-align:center;font-family:var(--mo)"/>
        <button type="button" onclick="S.inventory['${m.id}']=(S.inventory['${m.id}']||0)+1;render()" style="width:24px;height:24px;border:1.5px solid var(--g2);border-radius:6px;background:var(--w);font-size:15px;cursor:pointer;color:var(--g6)">+</button>
        ${isCustom?`<button type="button" onclick="S.meds=S.meds.filter(x=>x.id!=='${m.id}');render()" style="width:24px;height:24px;border:none;background:none;font-size:14px;cursor:pointer;color:var(--g4)">✕</button>`:''}
      </div>
    </div>`;}).join('')}
  </div>
  ${S.showNewMedForm?`<div class="new-med-form">
    <div style="font-size:11px;font-weight:600;color:var(--tl);margin-bottom:9px">➕ ${t('Agregar medicamento','Add medication')}</div>
    <div class="fld" style="margin-bottom:7px"><label>${t('Nombre','Name')}</label><input value="${S.newMedName}" oninput="S.newMedName=this.value" placeholder="${t('Ej: Amoxicilina 875mg','E.g. Amoxicillin 875mg')}"/></div>
    <div class="r2" style="margin-bottom:7px">
      <div class="fld" style="margin-bottom:0"><label>${t('Unidad','Unit')}</label><select onchange="S.newMedUnit=this.value">${MED_UNITS.map(u=>`<option value="${u}" ${S.newMedUnit===u?'selected':''}>${u}</option>`).join('')}</select></div>
      <div class="fld" style="margin-bottom:0"><label>${t('Cantidad','Qty')}</label><input type="number" value="${S.newMedQty||''}" oninput="S.newMedQty=parseInt(this.value)||0" placeholder="0"/></div>
    </div>
    <div style="display:flex;gap:8px">
      <button class="btn bt btn-sm" onclick="addMed()" style="flex:1">✓ ${t('Agregar','Add')}</button>
      <button class="btn bg btn-sm" onclick="set({showNewMedForm:false})" style="flex:1">${t('Cancelar','Cancel')}</button>
    </div>
  </div>`:`<button type="button" onclick="set({showNewMedForm:true})" style="width:100%;padding:11px;border:1.5px dashed var(--tl);border-radius:9px;background:var(--tll);color:var(--tl);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fn)">➕ ${t('Agregar medicamento','Add medication')}</button>`}`;
  return h;
}
function addMed() {
  const name=(S.newMedName||'').trim();const unit=S.newMedUnit||'tab';const qty=Math.max(0,parseInt(S.newMedQty)||0);
  if(!name){toast('⚠ '+t('Nombre requerido','Name required'));return;}
  const id=genMedId();S.meds=[...S.meds,{id,n:name,u:unit}];S.inventory[id]=qty;S.initInventory[id]=qty;
  S.newMedName='';S.newMedUnit='tab';S.newMedQty=0;S.showNewMedForm=false;
  toast(`✓ ${name}`);render();
}

function renderAldeas() {
  return `<div class="stl">📍 ${t('Aldeas','Villages')}</div>
  <div style="font-size:10px;color:var(--g6);margin-bottom:9px">${t('Jornada:','Session:')} <strong style="color:var(--tl)">${S.actLoc}</strong></div>
  <div style="margin-bottom:9px">${S.villages.map((v,i)=>`<div class="ald-i"><span style="flex:1">${v}${v===S.actLoc?' ✓':''}</span>
    <button type="button" onclick="S.villages=S.villages.filter((_,j)=>j!==${i});render()" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:14px;padding:2px 5px">✕</button>
  </div>`).join('')}</div>
  <div style="display:flex;gap:6px">
    <input id="nald" value="${S.newV||''}" placeholder="${t('Nombre de la aldea','Village name')}" oninput="S.newV=this.value" style="flex:1;padding:9px 11px;border:1.5px solid var(--g2);border-radius:8px;font-size:12px;font-family:var(--fn)"/>
    <button type="button" onclick="var v=(S.newV||'').trim();if(!v)return;if(!S.villages.includes(v)){S.villages=[...S.villages,v];pushFB();}S.newV='';toast('✓ '+v);render()" style="padding:9px 13px;border-radius:8px;background:var(--tl);color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fn)">${t('Agregar','Add')}</button>
  </div>`;
}


// ── USUARIOS ──────────────────────────────────────────────────────────────
function renderUsers() {
  const ops = S.operators || [];
  return `<div class="stl">👤 ${t('Operadores / Usuarios','Operators / Users')}</div>
  <div style="font-size:11px;color:var(--g6);margin-bottom:10px">${t('Estas personas aparecerán para seleccionar al inicio de cada jornada.','These people appear for selection at the start of each session.')}</div>
  <div style="margin-bottom:10px">
    ${ops.length===0?`<div style="text-align:center;padding:16px;color:var(--g4);font-size:12px">${t('Sin operadores — agrega el primero abajo','No operators — add the first one below')}</div>`:''}
    ${ops.map((op,i)=>`<div class="ald-i">
      <span style="flex:1;font-size:12px">👤 ${op}</span>
      <button type="button" onclick="removeOperator(${i})" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:14px;padding:2px 5px">✕</button>
    </div>`).join('')}
  </div>
  <div style="display:flex;gap:6px">
    <input id="new-op" value="${S.newOperator||''}" placeholder="${t('Nombre del operador','Operator name')}"
      oninput="S.newOperator=this.value"
      style="flex:1;padding:9px 11px;border:1.5px solid var(--g2);border-radius:8px;font-size:12px;font-family:var(--fn)"/>
    <button type="button" onclick="addOperator()" style="padding:9px 13px;border-radius:8px;background:var(--tl);color:#fff;border:none;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--fn)">${t('Agregar','Add')}</button>
  </div>`;
}
function addOperator() {
  const name = (S.newOperator||'').trim();
  if (!name) { toast('⚠ ' + t('Escribe un nombre','Enter a name')); return; }
  if (S.operators.includes(name)) { toast('⚠ ' + t('Ya existe','Already exists')); return; }
  S.operators = [...S.operators, name];
  S.newOperator = '';
  pushFB();
  toast(`✓ ${name} ${t('agregado','added')}`);
  render();
}
function removeOperator(i) {
  S.operators = S.operators.filter((_,j) => j !== i);
  pushFB();
  render();
}

function renderExport() {
  const isConfigured = SHEETS_URL && !SHEETS_URL.includes('REEMPLAZA');
  return `<div class="stl">↑ Exportar / Export</div>
  <div style="background:var(--g1);border-radius:10px;padding:13px;margin-bottom:12px;font-size:12px;color:var(--g6)">
    <strong style="color:var(--g9)">${S.patients.length}</strong> ${t('pacientes','patients')} · <strong style="color:var(--g9)">${S.actLoc}</strong> · ${S.actDate}
  </div>
  ${!isConfigured?`<div style="background:#fff3e0;border:1px solid #ffcc80;border-radius:9px;padding:12px;margin-bottom:12px;font-size:11px;color:#e65100">
    ⚠️ Google Sheets ${t('no está configurado. Edita','not configured. Edit')} <strong>app.js</strong> → SHEETS_URL.
  </div>`:''}
  <div style="display:flex;flex-direction:column;gap:8px">
    <button class="btn bt" onclick="doExportSheets()" style="opacity:${isConfigured?1:0.4}" ${!isConfigured?'disabled':''}>📊 ${t('Exportar todo a Google Sheets','Export all to Google Sheets')}</button>
    <button class="btn bg" onclick="exportCSV('patients')">📥 CSV — ${t('Pacientes','Patients')}</button>
    <button class="btn bg" onclick="exportCSV('spiritual')">📥 CSV — ${t('Espiritual','Spiritual')}</button>
    <button class="btn bg" onclick="exportCSV('pharmacy')">📥 CSV — ${t('Farmacia','Pharmacy')}</button>
  </div>`;
}
function doExportSheets() {
  if (typeof exportToSheets === 'function') exportToSheets(S, SHEETS_URL).then(ok=>toast(ok?'✓ Enviado a Sheets':'⚠ Error'));
}
function exportCSV(type) {
  let rows, filename;
  if (type==='patients') {
    rows=[['#','Nombre','Apellido','Edad','Género','Teléfono','Aldea','Jornada','Fecha','BP','Pulso','Peso kg','Temp','Fiebre','Diarrea','Vómitos','Dolor cabeza','Dolor articular','Tos','Hongos','Diabetes','Diagnóstico','Médico','Seguimiento','Estado','Hora entrega']];
    S.patients.forEach(p=>rows.push([p.dayNum,p.nombre,p.apellido,p.age,p.gender,p.phone||'',p.aldeaPaciente||'',p.location||'',p.date,p.bp||'',p.pulse||'',p.weightKg||'',`${p.temp||''}°${p.tempUnit||'F'}`,p.symptoms?.fiebre?'Sí':'',p.symptoms?.diarrea?'Sí':'',p.symptoms?.vomitos?'Sí':'',p.symptoms?.dolor_cabeza?'Sí':'',p.symptoms?.dolor_articular?'Sí':'',p.symptoms?.tos?'Sí':'',p.symptoms?.hongos?'Sí':'',p.conditions?.diabetes?'Sí':'',p.doctor?.diagnostico||'',p.doctor?.medico||'',p.doctor?.seguimiento?'Sí':'',p.status,p.deliveredAt||'']));
    filename=`elfaro_pacientes_${S.actDate.replace(/\//g,'-')}.csv`;
  } else if (type==='spiritual') {
    rows=[['#','Nombre','Apellido','Teléfono','Aldea','Fecha','Oración','Aceptó Cristo','Reconcilió','Contactar','Notas']];
    S.patients.forEach(p=>{const sp=p.spiritual||{};rows.push([p.dayNum,p.nombre,p.apellido,p.phone||'',p.aldeaPaciente||'',p.date,sp.prayed?'Sí':'',sp.accepted?'Sí':'',sp.reconciled?'Sí':'',sp.interested?'Sí':'',sp.notes||'']);});
    filename=`elfaro_espiritual_${S.actDate.replace(/\//g,'-')}.csv`;
  } else {
    rows=[['Medicamento','Unidad','Inicial','Actual','Consumido']];
    S.meds.forEach(m=>rows.push([m.n,m.u,S.initInventory[m.id]||0,S.inventory[m.id]||0,(S.initInventory[m.id]||0)-(S.inventory[m.id]||0)]));
    filename=`elfaro_farmacia_${S.actDate.replace(/\//g,'-')}.csv`;
  }
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}));a.download=filename;a.click();
  toast('✓ CSV descargado');
}

// ── START ──────────────────────────────────────────────────────────────────
function onFirebaseReady() {
  if (typeof initFirebase === 'function') initFirebase();
  if (S.setupDone && S.actLoc && S.actDate) {
    const key = typeof setSessionKey === 'function'
      ? setSessionKey(S.actDate, S.actLoc)
      : S.actDate + '_' + S.actLoc;
    if (typeof subscribeToSession === 'function') {
      subscribeToSession(key, data => {
        let changed = false;
        if (data.patients) {
          S.patients = typeof data.patients === 'object' && !Array.isArray(data.patients)
            ? Object.values(data.patients) : data.patients;
          changed = true;
        }
        if (data.inventory) {
          S.inventory = (typeof data.inventory === 'object' && data.inventory.inventory)
            ? data.inventory.inventory : data.inventory;
          changed = true;
        }
        if (data.meds) {
          const m = Array.isArray(data.meds) ? data.meds : Object.values(data.meds);
          if (m.length) S.meds = m;
        }
        if (data.initInventory) S.initInventory = data.initInventory;
        if (data.villages && Array.isArray(data.villages) && data.villages.length) {
          S.villages = data.villages; changed = true;
        }
        if (data.operators && Array.isArray(data.operators) && data.operators.length) {
          S.operators = data.operators; changed = true;
        }
        if (changed) { saveLocal(); render(); }
      });
    }
  }
}

// Wait for Firebase SDK to load (loaded via <script> tag in index.html)
function waitForFirebase(n) {
  if (typeof firebase !== 'undefined') {
    onFirebaseReady();
  } else if (n > 0) {
    setTimeout(() => waitForFirebase(n - 1), 200);
  }
}
waitForFirebase(30);
render();
