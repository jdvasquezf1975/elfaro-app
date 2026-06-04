// ============================================================
// EL FARO — Google Apps Script v2 (versión corregida)
//
// INSTRUCCIONES:
// 1. Abre tu Google Sheet → Extensiones → Apps Script
// 2. Borra TODO el código existente
// 3. Pega este código completo y guarda (Ctrl+S)
// 4. Implementar → Nueva implementación → Aplicación web
//    · Ejecutar como: Yo
//    · Quién tiene acceso: Cualquier persona  ← CRÍTICO
// 5. Clic en "Implementar" → autoriza los permisos
// 6. Copia la URL que termina en /exec
// 7. Pégala en app.js → SHEETS_URL
//
// VERIFICAR QUE FUNCIONA:
//   Abre la URL en tu navegador. Debes ver:
//   {"ok":true,"message":"El Faro API funcionando",...}
//   Si ves error de permisos → reimplementar con "Cualquier persona"
//
// ERRORES COMUNES:
//   ❌ URL termina en /dev → usar la de /exec
//   ❌ "Quién tiene acceso: Solo yo" → cambiar a "Cualquier persona"
//   ❌ Editaste el código pero no reimplementaste → Nueva implementación
// ============================================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    switch(data.type) {
      case 'new_patient':
      case 'update_patient': writePatient(ss, data.data); break;
      case 'dispensed':      writeDispensed(ss, data.data); break;
      case 'inventory_update': writeInventory(ss, data.data); break;
      case 'spiritual_update': writeSpiritual(ss, data.data); break;
      case 'export_all':     exportAll(ss, data.data); break;
    }
    return buildResp({ok: true, type: data.type});
  } catch(err) {
    return buildResp({ok: false, error: err.message});
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ok:true, message:'El Faro API funcionando', time:new Date().toLocaleString('es-GT')}))
    .setMimeType(ContentService.MimeType.JSON);
}

function buildResp(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ── PACIENTES ─────────────────────────────────────────────────────────────
function writePatient(ss, p) {
  if (!p) return;
  const headers = [
    '#Día','Código','Nombre','Apellido','Edad','Género','Teléfono',
    'Aldea Paciente','Aldea Jornada','Fecha','Hora Registro','Registrado Por',
    'BP','Pulso','Resp','Peso kg','Peso lb','Temp','Unidad Temp','Hora Signos',
    'Áreas Atención',
    'Fiebre','Diarrea','Vómitos','Dolor Cabeza','Dolor Articular','Tos','Hongos',
    'Otros Síntomas',
    'Hipertensión','Diabetes','Parkinson','Artritis','Alergias','Desnutrición',
    'Otras Condiciones',
    'Diagnóstico','Notas Médico','Médico','Seguimiento',
    'Estado','Hora Receta','Hora Entrega'
  ];
  const sheet = getOrCreate(ss, 'Pacientes', headers);
  const rows = sheet.getDataRange().getValues();
  const idx = rows.slice(1).findIndex(r => r[1] === (p.code||''));
  const row = [
    p.dayNum||'', p.code||'', p.nombre||p.name||'', p.apellido||'',
    p.age||'', p.gender==='M'?'Masculino':p.gender==='F'?'Femenino':p.gender||'',
    p.phone||'', p.aldeaPaciente||'', p.location||'',
    p.date||'', p.createdAt||'', p.registradoPor||'',
    p.bp||'', p.pulse||'', p.resp||'',
    p.weightKg||'', p.weightLb||'',
    p.temp||'', p.tempUnit||'F', p.vitalsAt||'',
    (p.areas||[]).join(', '),
    yn(p.symptoms,'fiebre'), yn(p.symptoms,'diarrea'), yn(p.symptoms,'vomitos'),
    yn(p.symptoms,'dolor_cabeza'), yn(p.symptoms,'dolor_articular'),
    yn(p.symptoms,'tos'), yn(p.symptoms,'hongos'), p.symptomsOther||'',
    yn(p.conditions,'hipertension'), yn(p.conditions,'diabetes'),
    yn(p.conditions,'parkinson'), yn(p.conditions,'artritis'),
    yn(p.conditions,'alergias'), yn(p.conditions,'desnutricion'),
    p.conditionsOther||'',
    (p.doctor&&p.doctor.diagnostico)||'', (p.doctor&&p.doctor.notas)||'',
    (p.doctor&&p.doctor.medico)||'',
    (p.doctor&&p.doctor.seguimiento)?'Sí':'No',
    statusLabel(p.status),
    (p.doctor&&p.doctor.prescribedAt)||'', p.deliveredAt||''
  ];
  if (idx === -1) sheet.appendRow(row);
  else sheet.getRange(idx+2, 1, 1, row.length).setValues([row]);
  autoFormat(sheet);
}

// ── FARMACIA ──────────────────────────────────────────────────────────────
function writeDispensed(ss, data) {
  if (!data||!data.patient) return;
  const sheet = getOrCreate(ss, 'Farmacia', [
    '#Día','Código','Nombre','Aldea','Fecha','Hora Entrega','Medicamento','Cantidad','Unidad','# Entrega'
  ]);
  const p=data.patient, d=data.delivery||{}, n=data.deliveryNum||1;
  (d.meds||[]).forEach(m => sheet.appendRow([
    p.dayNum||'', p.code||'', p.nombre||p.name||'', p.aldeaPaciente||p.location||'',
    p.date||'', d.at||'', m.name||'', m.qty||0, m.u||'u', n
  ]));
  autoFormat(sheet);
}

// ── INVENTARIO ────────────────────────────────────────────────────────────
function writeInventory(ss, data) {
  if (!data) return;
  const sheet = getOrCreate(ss, 'Inventario', ['Fecha','Hora','Medicamento','Unidad','Inicial','Actual','Consumido']);
  const last = sheet.getLastRow();
  if (last > 1) sheet.getRange(2, 1, last-1, 7).clearContent();
  const now = new Date();
  const tz = Session.getScriptTimeZone();
  const fecha = Utilities.formatDate(now, tz, 'dd/MM/yyyy');
  const hora  = Utilities.formatDate(now, tz, 'HH:mm');
  (data.meds||[]).forEach(m => sheet.appendRow([fecha, hora, m.name||'', m.unit||'', m.initial||0, m.current||0, (m.initial||0)-(m.current||0)]));
  autoFormat(sheet);
}

// ── ESPIRITUAL ────────────────────────────────────────────────────────────
function writeSpiritual(ss, data) {
  if (!data) return;
  const headers = ['#Día','Código','Nombre','Apellido','Teléfono','Aldea','Fecha','Oración','Aceptó Cristo','Se Reconcilió','Interesado Contacto','Notas'];
  const sheet = getOrCreate(ss, 'Espiritual', headers);
  const rows = sheet.getDataRange().getValues();
  const idx = rows.slice(1).findIndex(r => r[1] === (data.code||''));
  const sp = data.spiritual||{};
  const row = [
    data.dayNum||'', data.code||'', data.nombre||data.name||'', data.apellido||'',
    data.phone||'', data.aldeaPaciente||'', data.date||'',
    sp.prayed?'Sí':'No', sp.accepted?'Sí':'No', sp.reconciled?'Sí':'No', sp.interested?'Sí':'No', sp.notes||''
  ];
  if (idx === -1) sheet.appendRow(row);
  else sheet.getRange(idx+2, 1, 1, row.length).setValues([row]);
  autoFormat(sheet);
}

// ── EXPORTAR TODO ─────────────────────────────────────────────────────────
function exportAll(ss, data) {
  if (!data) return;
  (data.patients||[]).forEach(p => writePatient(ss, p));
  const headers = ['#Día','Código','Nombre','Apellido','Teléfono','Aldea','Fecha','Oración','Aceptó Cristo','Se Reconcilió','Interesado Contacto','Notas'];
  const sSheet = getOrCreate(ss, 'Espiritual', headers);
  const last = sSheet.getLastRow();
  if (last > 1) sSheet.getRange(2, 1, last-1, 12).clearContent();
  (data.patients||[]).forEach(p => {
    if (!p.spiritual) return;
    const sp = p.spiritual;
    sSheet.appendRow([
      p.dayNum||'', p.code||'', p.nombre||p.name||'', p.apellido||'',
      p.phone||'', p.aldeaPaciente||p.location||'', p.date||'',
      sp.prayed?'Sí':'No', sp.accepted?'Sí':'No', sp.reconciled?'Sí':'No', sp.interested?'Sí':'No', sp.notes||''
    ]);
  });
  autoFormat(sSheet);
  writeInventory(ss, {meds: data.inventory||[]});
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function getOrCreate(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    const hr = sheet.getRange(1, 1, 1, headers.length);
    hr.setBackground('#0d7a5f'); hr.setFontColor('#ffffff');
    hr.setFontWeight('bold'); hr.setFontSize(11);
    sheet.setFrozenRows(1);
  }
  return sheet;
}
function autoFormat(sheet) { try { sheet.autoResizeColumns(1, sheet.getLastColumn()); } catch(e){} }
function yn(obj, key) { return (obj && obj[key]) ? 'Sí' : ''; }
function statusLabel(s) { return {waiting:'En espera',attending:'En consulta',prescribed:'Con receta',delivered:'Entregado'}[s]||s||''; }

// ── PRUEBA MANUAL ─────────────────────────────────────────────────────────
// Ejecuta esta función desde el editor para verificar que funciona
function testScript() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  writePatient(ss, {
    dayNum:99, code:'TEST1', nombre:'Prueba', apellido:'Script',
    age:'30', gender:'M', phone:'5555-0000',
    aldeaPaciente:'San Lucas', location:'San Lucas', date:'01/01/2025',
    createdAt:'09:00', bp:'120/80', pulse:'72', weightKg:'70',
    temp:'98.6', tempUnit:'F', vitalsAt:'09:10',
    areas:['doctor'],
    symptoms:{fiebre:true,tos:true}, symptomsOther:'',
    conditions:{diabetes:false}, conditionsOther:'',
    doctor:{diagnostico:'Prueba exitosa',medico:'Dr.Test',seguimiento:false,prescribedAt:'09:30'},
    status:'prescribed'
  });
  Logger.log('PRUEBA EXITOSA — revisa la hoja Pacientes');
}
