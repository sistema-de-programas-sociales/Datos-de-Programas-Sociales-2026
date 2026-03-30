#!/usr/bin/env node
/**
 * build_institucion.js — Reporte individual por institución
 * Recibe: node build_institucion.js <data_json_path> <output_path>
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber,
} = require('docx');
const fs = require('fs');

const DATA_PATH = process.argv[2];
const OUT_PATH  = process.argv[3];

// ── Manejo global de errores síncronos ────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('ERR:' + err.message);
  process.exit(1);
});

const raw = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const { inst, inst_key, desglose_inst, mun_benef = {}, mun_apoyos_norm = {},
        prog_apoyos = {}, total_apoyos_inst = 0, apoyos_a3_inst = {},
        loc_total = 0, loc_m_inst = 0, loc_h_inst = 0,
        loc_rangos = {}, loc_municipios = {},
        gasto_inst_est = null, progs_con_gasto = 0,
        filtros_inst = {}, filtros_mun_inst = {}, filtro_activo = {},
        kpis_filtrados = null,
        MES, ANO, fecha_str, pob_estatal, pob_vulnerable, pob_municipal = {}, charts = {} } = raw;

// ── Paleta unificada (misma que reporte municipal) ───────────────────────────
const C = {
  // Azules — idénticos al reporte municipal
  prim:    '1B3A6B', primMed: '2E5BA8', primClar: 'D6E4F7', primPale: 'EEF4FB',
  azul:    '1B3A6B', azulMed: '2E5BA8', azulClar: 'D6E4F7', azulPale: 'EEF4FB',
  // Acento dorado + verde de cobertura (igual que municipio)
  acento:  'C8A000', acentoC: 'FFF3CC',
  verde:   '1A6B3C', verde_c: 'D6F0E0',
  // Neutros compartidos
  gris:    '555555', grisL:   'F5F5F5', grisM:    'DDDDDD',
  blanco:  'FFFFFF', negro:   '000000',
  rojo:    '8B1A1A', rojo_c:  'FAE0E0',
};

const PAGE_W = 10640;

function sf(v)  { return parseFloat(v) || 0; }
function fmt(n) { return Math.round(sf(n)).toLocaleString('es-MX'); }
function pct(a, b) {
  const d = sf(b); if (!d) return '0%';
  return (sf(a) / d * 100).toFixed(1) + '%';
}
const _MIN_TC = new Set(['a','ante','bajo','con','contra','de','del','desde','durante',
  'el','en','entre','hacia','hasta','la','las','lo','los','mediante','para',
  'por','que','se','sin','sobre','su','sus','tras','un','una','unas','unos','y']);
function tcStr(s) {
  if (!s) return s;
  if (s !== s.toUpperCase()) return s;
  return s.split(' ').map((w, i) =>
    (i === 0 || !_MIN_TC.has(w.toLowerCase()))
      ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      : w.toLowerCase()
  ).join(' ');
}

// ── Bordes ────────────────────────────────────────────────────────────────────
const brd     = (color='CCCCCC', size=1) => ({ style: BorderStyle.SINGLE, size, color });
const borders = { top: brd(), bottom: brd(), left: brd(), right: brd() };
const brdNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const brdNones = { top: brdNone, bottom: brdNone, left: brdNone, right: brdNone };

function scaleWidths(cols) {
  const raw = cols.reduce((a,b)=>a+b,0);
  const s = cols.map(w => Math.floor(w * PAGE_W / raw));
  s[s.length-1] += PAGE_W - s.reduce((a,b)=>a+b,0);
  return s;
}

// ── Helpers de celda ─────────────────────────────────────────────────────────
function tc(text, w, opts={}) {
  const { bold=false, color=C.gris, fill=C.blanco, size=17,
          align=AlignmentType.LEFT, italic=false } = opts;
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 110, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: align, children: [
      new TextRun({ text: String(text ?? '—'), bold, color, size, italics: italic, font: 'Arial' }),
    ]})],
  });
}

function tcH(text, w, fill=C.azulMed) {
  return new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 110, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: String(text), bold: true, color: C.blanco, size: 16, font: 'Arial' }),
    ]})],
  });
}

function hRow(cols, widths, fill=C.azulMed) {
  return new TableRow({ tableHeader: true, children: cols.map((c,i) => tcH(c, widths[i], fill)) });
}

function dRow(vals, widths, even=false, opts=[]) {
  const fill = even ? C.azulPale : C.blanco;
  return new TableRow({ cantSplit: true, children: vals.map((v,i) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA },
    shading: { fill: (opts[i]&&opts[i].fill)||fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: i===0?110:80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: i===0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
      children: [new TextRun({
        text: String(v??'0'), size: 17, font: 'Arial',
        color: (opts[i]&&opts[i].color)||C.gris,
        bold:  (opts[i]&&opts[i].bold)||false,
      })],
    })],
  }))});
}

function totRow(vals, widths) {
  return new TableRow({ cantSplit: true, children: vals.map((v,i) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA },
    shading: { fill: C.azulClar, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: i===0?110:80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: i===0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
      children: [new TextRun({ text: String(v), bold: true, size: 20, font: 'Arial', color: C.azul })],
    })],
  }))});
}

function spacer(n=6, keepNext=false) {
  return new Paragraph({ children: [], spacing: { before: 0, after: n*20 }, keepNext });
}

function label(text, opts={}) {
  const { bold=true, color=C.azulMed, size=20, border=false, pageBreak=false, keepNext=true } = opts;
  return new Paragraph({
    spacing: { before: 80, after: 40 },
    border: border ? { bottom: brd(C.azulMed, 4) } : {},
    pageBreakBefore: pageBreak,
    keepNext,
    children: [new TextRun({ text, bold, color, size, font: 'Arial' })],
  });
}

function body(text, keepNext=false) {
  return new Paragraph({
    spacing: { before: 0, after: 60 },
    keepNext,
    children: [new TextRun({ text, size: 18, font: 'Arial', color: C.gris })],
  });
}

// ── Header / Footer ───────────────────────────────────────────────────────────
function makeHeader() {
  return new Header({ children: [new Paragraph({
    border: { bottom: brd(C.azulMed, 6) },
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `REPORTE INSTITUCIONAL — ${inst_key}`, bold: true, size: 18, color: C.azul, font: 'Arial' }),
      new TextRun({ text: `     ${MES.replace(/_/g,' ')} ${ANO}  |  SDHyBC — Gobierno del Estado de Chihuahua`, size: 16, color: C.gris, font: 'Arial' }),
    ],
  })]});
}

function makeFooter() {
  return new Footer({ children: [new Paragraph({
    border: { top: brd(C.azulMed, 4) },
    alignment: AlignmentType.RIGHT,
    spacing: { before: 80 },
    children: [
      new TextRun({ text: 'Página ', size: 15, color: C.gris, font: 'Arial' }),
      new TextRun({ children: [PageNumber.CURRENT], size: 15, color: C.gris, font: 'Arial' }),
      new TextRun({ text: ' de ', size: 15, color: C.gris, font: 'Arial' }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: C.gris, font: 'Arial' }),
    ],
  })]});
}

// ── KPI ───────────────────────────────────────────────────────────────────────
function kpiCell(label_text, value, sub, w, fill=C.azulClar) {
  return new TableCell({
    borders: brdNones, width: { size: w, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: value, bold: true, size: 22, color: C.azul, font: 'Arial' })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: label_text, size: 13, color: C.azulMed, font: 'Arial', bold: true })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: sub, size: 13, color: C.gris, font: 'Arial', italics: true })
      ]}),
    ],
  });
}
function kpiRow(items) {
  const w = Math.floor(PAGE_W / items.length);
  const widths = items.map((_,i) => i < items.length-1 ? w : PAGE_W - w*(items.length-1));
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ children: items.map((it,i) => kpiCell(it.label, it.value, it.sub, widths[i], it.fill||C.azulClar)) })],
  });
}

// chartRow eliminado — gráficas removidas del reporte

// ── Helpers ───────────────────────────────────────────────────────────────────
// Lookup de población municipal tolerante a tildes
function pobMun(name) {
  if (!name) return 0;
  // Intento directo
  if (pob_municipal[name]) return sf(pob_municipal[name]);
  // Sin tilde
  const norm = name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
  if (pob_municipal[norm]) return sf(pob_municipal[norm]);
  // Buscar case-insensitive
  const keys = Object.keys(pob_municipal);
  const found = keys.find(k => k.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase() === norm);
  return found ? sf(pob_municipal[found]) : 0;
}

// ── Datos ─────────────────────────────────────────────────────────────────────
// Si hay filtros activos, los KPIs principales usan los valores filtrados.
// Si no, usan los datos globales de la institución.
const hayFiltro = kpis_filtrados !== null && kpis_filtrados !== undefined;
const total   = hayFiltro ? sf(kpis_filtrados.total)        : sf(inst.total);
const m_tot   = hayFiltro ? sf(kpis_filtrados.m)            : sf(inst.m);
const h_tot   = hayFiltro ? sf(kpis_filtrados.h)            : sf(inst.h);
const sn_tot  = hayFiltro ? sf(kpis_filtrados.sn)           : sf(inst.sn);
const rangos  = inst.rangos || {};
const progs   = inst.programas || [];

// Apoyos: si hay filtro usar total filtrado, si no el de desglose
const total_apoyos_display = hayFiltro
  ? sf(kpis_filtrados.total_apoyos)
  : desglose_inst.reduce((s, e) => s + sf(e.total), 0);

// Localizables: si hay filtro usar localizables filtrados
const loc_total_display  = hayFiltro ? sf(kpis_filtrados.loc_total) : sf(loc_total);
const loc_m_display      = hayFiltro ? sf(kpis_filtrados.loc_m)     : sf(loc_m_inst);
const loc_h_display      = hayFiltro ? sf(kpis_filtrados.loc_h)     : sf(loc_h_inst);

// Municipios: beneficiarios desde mun_benef (hoja Beneficiarios por Municipio)
// mun_benef = {mun_name: {m, h, total}} — fuente correcta
const muns_sorted   = Object.entries(mun_benef)
  .map(([k, v]) => [k, sf(v.total)])
  .sort((a,b) => b[1]-a[1]);

// Apoyos entregados por municipio (mun_apoyos_norm viene de Python con clave normalizada)
// Necesitamos mapear nombre_con_tilde → total_apoyos usando normalización
const apoyo_totales = {};
for (const entry of desglose_inst) {
  const ak = entry.apoyo || '?';
  const t  = sf(entry.total);
  apoyo_totales[ak] = (apoyo_totales[ak] || 0) + t;
}
// mun_apoyos_local: {mun_name_con_tilde: total} — match por norma
function normKey(s) {
  if (!s) return '';
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
}
const mun_apoyos_local = {};
for (const [normMun, total_ap] of Object.entries(mun_apoyos_norm)) {
  // Encontrar el nombre con tilde en mun_benef
  const munName = Object.keys(mun_benef).find(k => normKey(k) === normMun) || normMun;
  mun_apoyos_local[munName] = total_ap;
}

const apoyos_sorted = Object.entries(apoyo_totales).sort((a,b)=>b[1]-a[1]);
const n_muns   = muns_sorted.length;                          // global (sin filtro)
const n_apoyos = Object.keys(apoyo_totales).length;           // tipos distintos globales

// ── Conteos filtrados (usados en KPIs y conclusiones cuando hayFiltro) ────────
// n_muns_f: número de municipios con beneficiarios en el filtro activo
// n_progs_f: número de programas con beneficiarios en el filtro activo
// n_tipos_f: número de tipos de apoyo entregados en el filtro activo
const n_muns_f  = hayFiltro
  ? (kpis_filtrados.por_municipio || []).filter(x => x.total > 0).length
  : n_muns;
const n_progs_f = hayFiltro
  ? (kpis_filtrados.por_programa || []).filter(x => x.total > 0).length
  : progs.length;
const n_tipos_f = hayFiltro
  ? (kpis_filtrados.apoyos_por_tipo || []).length
  : n_apoyos;

// ── Grupos de edad
const ninos_t   = sf(rangos['0-5'])   + sf(rangos['6-11']);
const jovenes_t = sf(rangos['12-17']) + sf(rangos['18-29']);
const adultos_t = sf(rangos['30-49']) + sf(rangos['50-64']);
const mayores_t = sf(rangos['65+']);
const sndatos_t = sf(rangos['sin_datos']);

// Total apoyos calculado desde desglose_inst — fuente única, consistente con tabla Sección 4
const total_apoyos_inst_calc = desglose_inst.reduce((s, e) => s + sf(e.total), 0);


const children = [];

// 1. PORTADA
children.push(new Paragraph({
  spacing: { before: 0, after: 0 },
  shading: { fill: C.azul, type: ShadingType.CLEAR },
  border:  { bottom: brd(C.acento, 10) },
  children: [
    new TextRun({ text: `  ${inst_key}`, bold: true, size: 46, color: C.blanco, font: 'Arial' }),
  ],
}));
children.push(new Paragraph({
  spacing: { before: 0, after: 100 },
  children: [new TextRun({
    text: `Reporte Institucional  ·  ${MES.replace(/_/g,' ')} ${ANO}  ·  Secretaría de Desarrollo Humano y Bien Común`,
    size: 17, color: C.gris, font: 'Arial',
  })],
}));

// PORTADA: KPIs — misma estructura que reporte municipal (4 filas)
children.push(label('Indicadores clave de la institución', { border: true }));
children.push(spacer(2));

// Fila 1: Beneficiarios y desglose por sexo + cobertura (igual que municipio)
const sn_pct_inst = total > 0 ? (sn_tot/total*100).toFixed(1)+'%' : '0%';
children.push(kpiRow([
  { label: 'Beneficiarios únicos',  value: fmt(total),                                        sub: hayFiltro ? (kpis_filtrados.filtro_desc || 'filtrado') : 'personas atendidas' },
  { label: 'Mujeres',               value: `${fmt(m_tot)} (${pct(m_tot,total)})`,             sub: 'del total' },
  { label: 'Hombres',               value: `${fmt(h_tot)} (${pct(h_tot,total)})`,             sub: 'del total' },
  { label: 'Sin dato de sexo',       value: `${fmt(sn_tot)} (${sn_pct_inst})`,                sub: 'del total',               fill: C.azulPale },
  { label: 'Cobertura institucional', value: pct(total, pob_vulnerable),                      sub: 'de pob. en vulnerabilidad', fill: C.verde_c },
]));
children.push(spacer(3));

// Fila 2: Actividad y cobertura
children.push(kpiRow([
  { label: 'Apoyos entregados',        value: fmt(total_apoyos_display),                     sub: 'total en el período' },
  { label: 'Programas activos',        value: fmt(n_progs_f),                                sub: `en esta institución` },
  { label: 'Municipios con cobertura', value: fmt(n_muns_f),                                 sub: 'de 67 municipios' },
  { label: 'Tipos de apoyo',           value: fmt(n_tipos_f),                                sub: 'distintos entregados',    fill: C.verde_c },
]));
children.push(spacer(3));

// Fila 3: Localizables
const loc_total_n   = loc_total_display;
const loc_pct_inst  = total > 0 ? (loc_total_n/total*100).toFixed(1)+'%' : '—';
children.push(kpiRow([
  { label: 'Beneficiarios localizables', value: fmt(loc_total_n),
    sub: loc_total_n > 0 ? `${loc_pct_inst} de beneficiarios únicos` : 'sin datos de localización',
    fill: loc_total_n > 0 ? C.verde_c : C.azulPale },
  { label: 'Mujeres localizables',  value: fmt(loc_m_display),
    sub: loc_total_n > 0 ? `${pct(loc_m_display, loc_total_n)} del total localizable` : '—' },
  { label: 'Hombres localizables',  value: fmt(loc_h_display),
    sub: loc_total_n > 0 ? `${pct(loc_h_display, loc_total_n)} del total localizable` : '—' },
]));
children.push(spacer(3));

// Fila 4: Presupuesto | Gasto | Gasto más alto (apoyo y programa)
const { pres_total_inst = null, gasto_total_inst = null, top_gasto_item = null } = raw;
function fmtMXN(v) {
  if (!v || v <= 0) return '—';
  return '$' + Math.round(v).toLocaleString('es-MX') + ' MXN';
}
const topLabel = top_gasto_item
  ? `${top_gasto_item.apoyo || '—'}  ·  ${top_gasto_item.programa || '—'}`
  : 'Sin datos';
const topSub = top_gasto_item
  ? `gasto est. ${fmtMXN(top_gasto_item.gasto)}`
  : 'capture gasto en Indicadores y Metas';
children.push(kpiRow([
  { label: 'Presupuesto total',
    value: fmtMXN(pres_total_inst),
    sub: pres_total_inst > 0 ? 'presupuesto asignado a la institución' : 'capture presupuesto en Indicadores y Metas',
    fill: pres_total_inst > 0 ? C.verde_c : C.azulPale },
  { label: 'Gasto total',
    value: fmtMXN(gasto_total_inst),
    sub: gasto_total_inst > 0 ? 'gasto registrado en el período' : 'sin datos de gasto registrados' },
  { label: 'Gasto más alto — apoyo y programa',
    value: topLabel,
    sub: topSub,
    fill: top_gasto_item ? C.azulClar : C.azulPale },
]));
children.push(spacer(6));

// 1. Programas de la institución
children.push(label('1.  Programas de la institución', { border: true, pageBreak: true }));
children.push(spacer(2, true));
{
  const pW = scaleWidths([46, 9, 9, 9, 12, 15]);
  const rows = [hRow(['Programa','Mujeres','Hombres','Sin dato','Apoyos','Beneficiarios'], pW)];

  // prog_apoyos viene de tabla G3 del Excel — fuente directa
  const progAp = {};
  for (const [k,v] of Object.entries(prog_apoyos)) {
    if (sf(v) >= 2) progAp[k] = sf(v);
  }
  const normP = (s) => s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase() : '';

  if (hayFiltro && kpis_filtrados.por_programa && kpis_filtrados.por_programa.length > 0) {
    // Usar datos filtrados de beneficiarios (m/h/total del filtro activo)
    // Apoyos: desde kpis_filtrados.apoyos_por_programa (nueva tabla, filtrada por rango)
    const apByProg = {};
    for (const ap of (kpis_filtrados.apoyos_por_programa || [])) {
      apByProg[normP(ap.nombre)] = ap;
    }
    const progsFiltradas = [...kpis_filtrados.por_programa].sort((a,b) => sf(b.total)-sf(a.total));
    progsFiltradas.forEach((p, i) => {
      const apEntry = apByProg[normP(p.nombre||'')] || {};
      const apTotal = sf(apEntry.total) || 0;
      rows.push(dRow([
        tcStr(p.nombre||'—'), fmt(p.m), fmt(p.h), fmt(p.sn||0),
        apTotal > 0 ? fmt(apTotal) : '—', fmt(p.total),
      ], pW, i%2===1));
    });
  } else {
    // Sin filtro: usar datos globales de la institución
    const progsSorted = [...progs].sort((a,b) => sf(b.total)-sf(a.total));
    progsSorted.forEach((p,i) => {
      const ap = progAp[p.nombre] ||
                 Object.entries(progAp).find(([k]) => normP(k) === normP(p.nombre||''))?.[1] || 0;
      rows.push(dRow([
        tcStr(p.nombre||'—'), fmt(p.m), fmt(p.h), fmt(p.sn||0), fmt(ap), fmt(p.total),
      ], pW, i%2===1));
    });
  }

  const total_ap_filtrado = hayFiltro
    ? sf(kpis_filtrados.total_apoyos)   // total de la fila de institución (deduplicado)
    : Object.values(progAp).reduce((s,v) => s+v, 0);
  rows.push(totRow(['TOTAL PROGRAMAS', fmt(m_tot), fmt(h_tot), fmt(sn_tot),
    total_ap_filtrado > 0 ? fmt(total_ap_filtrado) : '—', fmt(total)], pW));
  children.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: pW, rows,
  }));
}

// 2. Distribución por grupos de edad
children.push(spacer(8));
children.push(label('2.  Distribución por grupos de edad', { border: true, pageBreak: false }));
children.push(spacer(2, true));
{
  const gW = scaleWidths([30, 14, 14, 14, 14, 14]);

  // Fuente de rangos: filtrada si hay filtro activo, global si no
  function getRangoVal(key) {
    if (hayFiltro && kpis_filtrados.por_rango) {
      const rv = kpis_filtrados.por_rango[key] || {};
      return sf(rv.total) || sf(rv.m) + sf(rv.h);
    }
    return sf(rangos[key]);
  }
  const ninos_d   = getRangoVal('0-5')   + getRangoVal('6-11');
  const jovenes_d = getRangoVal('12-17') + getRangoVal('18-29');
  const adultos_d = getRangoVal('30-49') + getRangoVal('50-64');
  const mayores_d = getRangoVal('65+');
  const sndatos_d = hayFiltro ? 0 : sf(rangos['sin_datos']);

  const grupos = [
    ['0 – 5 años',            getRangoVal('0-5')],
    ['6 – 11 años',           getRangoVal('6-11')],
    ['12 – 17 años',          getRangoVal('12-17')],
    ['18 – 29 años',          getRangoVal('18-29')],
    ['30 – 49 años',          getRangoVal('30-49')],
    ['50 – 64 años',          getRangoVal('50-64')],
    ['65 años o más',         getRangoVal('65+')],
    ['Sin dato de edad',      sndatos_d],
  ].filter(([,t]) => t > 0 || !hayFiltro);

  const rows = [hRow(['Rango de edad','Beneficiarios','% del total','Mujeres','Hombres','Relación M/H'], gW)];
  grupos.forEach(([g,t],i) => {
    let mV, hV;
    if (hayFiltro && kpis_filtrados.por_rango) {
      // Obtener M/H directamente del filtro
      const rKey = {'0 – 5 años':'0-5','6 – 11 años':'6-11','12 – 17 años':'12-17',
                    '18 – 29 años':'18-29','30 – 49 años':'30-49','50 – 64 años':'50-64',
                    '65 años o más':'65+','Sin dato de edad':'sin_datos'}[g];
      const rv = kpis_filtrados.por_rango[rKey] || {};
      mV = sf(rv.m); hV = sf(rv.h);
    } else {
      const propM = total > 0 ? m_tot/total : 0;
      const propH = total > 0 ? h_tot/total : 0;
      mV = Math.round(t * propM); hV = Math.round(t * propH);
    }
    const rel = hV > 0 ? (mV/hV).toFixed(2) : '—';
    rows.push(dRow([g, fmt(t), pct(t,total), fmt(mV), fmt(hV), rel], gW, i%2===1));
  });
  rows.push(totRow(['TOTAL', fmt(total), '100%', fmt(m_tot), fmt(h_tot), '—'], gW));
  children.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: gW, rows,
  }));
}
children.push(spacer(6));

// 5. Distribución municipal
children.push(label('3.  Cobertura municipal', { border: true, pageBreak: true }));
children.push(spacer(2));

// Datos de municipios: filtrados si hay filtro activo, globales si no
// FORÁNEO / NO IDENTIFICADO: NO se muestran nunca (tienen 0 beneficiarios únicos)
const muns_display = (() => {
  if (hayFiltro && kpis_filtrados.por_municipio && kpis_filtrados.por_municipio.length > 0) {
    // Con filtro: solo municipios con beneficiarios > 0
    return kpis_filtrados.por_municipio
      .filter(x => sf(x.total) > 0)
      .map(x => [x.municipio, x.total, x.m, x.h, sf(x.apoyos_total)||0]);
  } else {
    // Sin filtro: municipios reales desde mun_benef (ya excluye especiales)
    return muns_sorted.map(([name, t]) => {
      const mh = mun_benef[name] || { m: 0, h: 0 };
      return [name, t, mh.m || 0, mh.h || 0, mun_apoyos_local[name] || 0];
    });
  }
})();

const n_muns_display = muns_display.length;
const top3muns = muns_display.slice(0,3)
  .map(([m,t]) => `${tcStr(m)} (${fmt(t)})`).join(', ');

children.push(body(
  `La institución ${inst_key} registra presencia en ${fmt(n_muns_display)} municipio${n_muns_display!==1?'s':''} del estado. ` +
  `Los municipios con mayor número de beneficiarios son ${top3muns}.`
));
children.push(spacer(3, true));

{
  const mW = scaleWidths([30, 10, 10, 10, 13, 13, 14]);
  const rows = [hRow(['Municipio','Benef.','Mujeres','Hombres','Apoyos entregados','% Institución','% Pob. municipal'], mW)];
  muns_display.forEach(([mun_name, t, mV, hV, apoyosV], i) => {
    const pob_mun = pobMun(mun_name);
    const pct_pob = pob_mun > 0 ? (t / pob_mun * 100).toFixed(1) + '%' : '—';
    rows.push(dRow([
      tcStr(mun_name), fmt(t), fmt(mV), fmt(hV), apoyosV > 0 ? fmt(apoyosV) : '—', pct(t, total), pct_pob,
    ], mW, i%2===1));
  });
  rows.push(totRow(['TOTAL', fmt(total), fmt(m_tot), fmt(h_tot), fmt(total_apoyos_display), '100%', '—'], mW));
  children.push(new Table({
    width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: mW, rows,
  }));
}
children.push(spacer(6));

// 6. Apoyos entregados
children.push(label('4.  Apoyos entregados', { border: true, pageBreak: true }));
children.push(spacer(2, true));
{
  // Fuente de apoyos:
  // - CON FILTRO: kpis_filtrados.apoyos_por_tipo (Tabla A izquierda filtrada por rango)
  //   Tipos de apoyo con M/H/Total para el rango seleccionado
  // - SIN FILTRO: desglose_inst (global, todos los rangos)
  const aW = scaleWidths([30, 30, 10, 8, 8, 14]);
  const aRowsT = [hRow(['Tipo de apoyo', 'Programa que entrega', 'Apoyos', 'Mujeres', 'Hombres', '% Total'], aW)];

  let a3_flat;

  if (hayFiltro && kpis_filtrados.apoyos_por_tipo && kpis_filtrados.apoyos_por_tipo.length > 0) {
    // Con filtro: tipos de apoyo desde Tabla A filtrada por rango de edad
    // Los programas los cruzamos desde desglose_inst por nombre de apoyo
    const progsByApoyo = {};
    for (const e of desglose_inst) {
      const ak = normKey(e.apoyo || '');
      if (!progsByApoyo[ak]) progsByApoyo[ak] = new Set();
      if (e.programa && e.programa !== '—') progsByApoyo[ak].add(tcStr(e.programa));
    }
    a3_flat = kpis_filtrados.apoyos_por_tipo.map(a => ({
      apoyo:  a.apoyo,
      progs:  progsByApoyo[normKey(a.apoyo || '')] || new Set(),
      m:      sf(a.m),
      h:      sf(a.h),
      total:  sf(a.total),
    })).sort((a,b) => b.total - a.total);
  } else {
    // Sin filtro: datos globales desde desglose_inst
    const apMap = {};
    for (const e of desglose_inst) {
      const ak = e.apoyo;
      if (!apMap[ak]) apMap[ak] = { apoyo: ak, progs: new Set(), m: 0, h: 0, total: 0 };
      if (e.programa && e.programa !== '—') apMap[ak].progs.add(tcStr(e.programa));
      apMap[ak].m     += sf(e.m);
      apMap[ak].h     += sf(e.h);
      apMap[ak].total += sf(e.total);
    }
    a3_flat = Object.values(apMap).sort((a,b) => b.total - a.total);
  }

  const grand_a3 = hayFiltro ? sf(total_apoyos_display) : a3_flat.reduce((s,r) => s+r.total, 0);
  a3_flat.forEach((r,i) => {
    const fill = i%2===1 ? C.azulPale : C.blanco;
    const pct_a = grand_a3 > 0 ? (r.total/grand_a3*100).toFixed(1)+'%' : '—';
    const progsList = r.progs.size > 0 ? [...r.progs].sort() : ['—'];

    // Celda de programas: un párrafo por programa con bullet visual
    const progChildren = progsList.map((p, pi) => new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: pi === 0 ? 0 : 40, after: 0 },
      children: [
        new TextRun({ text: progsList.length > 1 ? '• ' : '', bold: true, size: 16, color: C.azulMed, font: 'Arial' }),
        new TextRun({ text: p, size: 16, color: C.gris, font: 'Arial', italics: progsList.length > 1 }),
      ],
    }));

    const progsCell = new TableCell({
      borders, width: { size: aW[1], type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 100, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      children: progChildren,
    });

    aRowsT.push(new TableRow({ cantSplit: true, children: [
      // col 0: tipo de apoyo
      new TableCell({
        borders, width: { size: aW[0], type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 110, right: 80 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [
          new TextRun({ text: tcStr(r.apoyo), size: 17, color: C.gris, font: 'Arial' }),
        ]})],
      }),
      progsCell,
      // cols 2-5: números
      ...[fmt(r.total), fmt(r.m), fmt(r.h), pct_a].map((val, ci) => new TableCell({
        borders, width: { size: aW[ci+2], type: WidthType.DXA },
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
          new TextRun({ text: val, size: 17, color: C.gris, font: 'Arial' }),
        ]})],
      })),
    ]}));
  });
  aRowsT.push(totRow(['TOTAL', '', fmt(grand_a3), fmt(a3_flat.reduce((s,r)=>s+r.m,0)), fmt(a3_flat.reduce((s,r)=>s+r.h,0)), '100%'], aW));

  children.push(new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: aW, rows: aRowsT }));
}

// ── Sección 5: Beneficiarios Localizables ───────────────────────────────────
children.push(label('5.  Beneficiarios localizables', { border: true, pageBreak: true }));
children.push(spacer(2));
{
  // Fuentes según filtro:
  // - KPIs: loc_total_display / loc_m_display / loc_h_display (ya usan filtro)
  // - Rangos: hayFiltro → kpis_filtrados.loc_por_rango | no → loc_rangos
  // - Municipios: hayFiltro → kpis_filtrados.loc_por_municipio | no → loc_municipios
  const loc_tot_sec5  = loc_total_display;
  const loc_m_sec5    = loc_m_display;
  const loc_h_sec5    = loc_h_display;
  const loc_no        = total - loc_tot_sec5;
  const loc_pct       = total > 0 ? (loc_tot_sec5/total*100).toFixed(1)+'%' : '—';
  const no_loc_pct    = total > 0 ? (loc_no/total*100).toFixed(1)+'%' : '—';

  // KPIs
  children.push(kpiRow([
    { label: 'Beneficiarios localizables', value: fmt(loc_tot_sec5),
      sub: loc_tot_sec5 > 0 ? `${loc_pct} del total institucional` : 'sin datos de localización',
      fill: loc_tot_sec5 > 0 ? C.verde_c : C.azulPale },
    { label: 'Mujeres localizables',  value: fmt(loc_m_sec5),
      sub: loc_tot_sec5 > 0 ? `${pct(loc_m_sec5, loc_tot_sec5)} del total localizable` : '—' },
    { label: 'Hombres localizables',  value: fmt(loc_h_sec5),
      sub: loc_tot_sec5 > 0 ? `${pct(loc_h_sec5, loc_tot_sec5)} del total localizable` : '—' },
    { label: 'No localizables',       value: fmt(loc_no),
      sub: `${no_loc_pct} sin datos de localización`, fill: C.azulPale },
  ]));
  children.push(spacer(3, true));

  children.push(body(
    `Un beneficiario localizable es aquel cuyo registro cuenta con nombre, apellido, sexo, ` +
    `fecha de nacimiento, CURP, municipio, teléfono y código postal válidos. ` +
    (loc_tot_sec5 > 0
      ? `Se identificaron ${fmt(loc_tot_sec5)} beneficiarios localizables (${loc_pct} del total de la institución).`
      : `No se encontraron beneficiarios localizables registrados para esta institución en el período.`)
  ));
  children.push(spacer(3));

  // Tabla por rango de edad
  {
    const rW = scaleWidths([24, 11, 11, 11, 11, 11, 11, 10]);
    const AGE_LABELS = [['0-5','0–5'],['6-11','6–11'],['12-17','12–17'],['18-29','18–29'],['30-49','30–49'],['50-64','50–64'],['65+','65+']];
    const rRows = [hRow(['Indicador', ...AGE_LABELS.map(a=>a[1])], rW)];
    let rVals;
    if (hayFiltro && kpis_filtrados.loc_por_rango) {
      // Con filtro: solo rangos del filtro, desde loc_por_rango
      rVals = AGE_LABELS.map(([k]) => {
        const rv = kpis_filtrados.loc_por_rango[k] || {};
        return sf(rv.total) || sf(rv.m) + sf(rv.h);
      });
    } else {
      // Sin filtro: rangos globales desde loc_rangos
      rVals = AGE_LABELS.map(([k]) => sf((loc_rangos||{})[k] || 0));
    }
    rRows.push(dRow(['Localizables', ...rVals.map(v=>fmt(v))], rW, false));
    const rTot = rVals.reduce((s,v)=>s+v,0);
    rRows.push(dRow(['% del total', ...rVals.map(v=> rTot>0?(v/rTot*100).toFixed(1)+'%':'—')], rW, true));
    children.push(new Paragraph({ spacing:{before:40,after:20}, keepNext: true,
      children:[new TextRun({text:'Distribución por rango de edad',bold:true,size:18,color:C.azul,font:'Arial'})]}));
    children.push(new Table({ width:{size:PAGE_W,type:WidthType.DXA}, columnWidths:rW, rows:rRows }));
    children.push(spacer(3));
  }

  // Tabla por municipio
  {
    children.push(new Paragraph({ spacing:{before:40,after:20}, keepNext: true,
      children:[new TextRun({text:'Distribución por municipio',bold:true,size:18,color:C.azul,font:'Arial'})]}));
    const mW = scaleWidths([40, 13, 13, 20, 14]);
    const mRows = [hRow(['Municipio','Mujeres','Hombres','Total localizables','% del total'], mW)];

    let locMuns;
    if (hayFiltro && kpis_filtrados.loc_por_municipio && kpis_filtrados.loc_por_municipio.length > 0) {
      // Con filtro: municipios filtrados desde loc_por_municipio
      locMuns = kpis_filtrados.loc_por_municipio
        .filter(x => sf(x.total) > 0)
        .sort((a,b) => sf(b.total) - sf(a.total))
        .map(x => [x.municipio, {m: sf(x.m), h: sf(x.h), total: sf(x.total)}]);
    } else {
      // Sin filtro: municipios globales desde loc_municipios
      locMuns = Object.entries(loc_municipios||{}).sort((a,b)=>b[1].total-a[1].total);
    }

    if (locMuns.length > 0) {
      locMuns.forEach(([mun, v], i) => {
        const pctM = loc_tot_sec5 > 0 ? (v.total/loc_tot_sec5*100).toFixed(1)+'%' : '—';
        mRows.push(dRow([tcStr(mun), fmt(v.m), fmt(v.h), fmt(v.total), pctM], mW, i%2===1));
      });
    } else {
      mRows.push(dRow(['Sin datos de municipio', '—', '—', '0', '—'], mW, false));
    }
    mRows.push(totRow(['TOTAL', fmt(loc_m_sec5), fmt(loc_h_sec5), fmt(loc_tot_sec5), ''], mW));
    children.push(new Table({ width:{size:PAGE_W,type:WidthType.DXA}, columnWidths:mW, rows:mRows }));
    children.push(spacer(3));
  }
}
children.push(spacer(6));

// ── Sección 8: Indicadores presupuestales ──────────────────────────────────
children.push(label('6.  Indicadores presupuestales y de desempeño', { border: true, pageBreak: true }));
children.push(spacer(2));
{
  if (gasto_inst_est && gasto_inst_est > 0) {
    const gastoXBenef = gasto_inst_est / total;
    const bullets = [
      `El gasto estimado para la institución ${inst} asciende a ${Math.round(gasto_inst_est).toLocaleString('es-MX')} MXN, calculado con base en los programas con datos de gasto registrados.`,
      `El gasto estimado por beneficiario único es de ${Math.round(gastoXBenef).toLocaleString('es-MX')} MXN.`,
      `Este estimado se basa en la información presupuestal disponible. Se recomienda completar el registro de gasto en todos los programas para mayor precisión.`,
    ];
    bullets.forEach(b => children.push(new Paragraph({
      spacing: { before: 40, after: 60 }, indent: { left: 360 },
      children: [
        new TextRun({ text: '• ', bold: true, size: 18, color: C.azul, font: 'Arial' }),
        new TextRun({ text: b, size: 18, color: C.gris, font: 'Arial' }),
      ],
    })));
  } else {
    children.push(new Paragraph({
      spacing: { before: 40, after: 60 }, indent: { left: 360 },
      children: [new TextRun({
        text: 'No se cuenta con datos presupuestales registrados para esta institución en el período reportado. Se recomienda capturar la información de gasto por programa para habilitar este análisis.',
        size: 18, color: C.gris, font: 'Arial',
      })],
    }));
  }
}
children.push(spacer(6));

// ── SECCIÓN 7: CONCLUSIONES Y OBSERVACIONES ──────────────────────────────────

children.push(label('7. Conclusiones y Observaciones', { border: true, pageBreak: true }));
children.push(body(`Con base en los datos registrados al corte de ${MES.replace(/_/g,' ')} ${ANO}, se presentan las siguientes conclusiones para la institución ${inst_key}:`));
children.push(spacer(4));

// ── 7.1 Cobertura y beneficiarios ────────────────────────────────────────────
children.push(label('7.1  Cobertura poblacional y beneficiarios', { bold: true, color: C.azulMed, size: 18, border: false }));
children.push(spacer(2));

const cob_inst_vul = pob_vulnerable > 0 ? pct(total, pob_vulnerable) : null;

// Grupo de edad dominante
const grupos_inst = [
  { nombre: 'niños y niñas (0 a 11 años)',    val: ninos_t },
  { nombre: 'jóvenes (12 a 29 años)',          val: jovenes_t },
  { nombre: 'adultos (30 a 64 años)',           val: adultos_t },
  { nombre: 'adultos mayores (65 años o más)', val: mayores_t },
];
const grupoDom_inst = grupos_inst.reduce((a, b) => b.val > a.val ? b : a);

const topProg_inst = [...progs].sort((a,b) => sf(b.total)-sf(a.total))[0];

const bullets71 = [];

if (cob_inst_vul) {
  bullets71.push(`Se atendieron ${fmt(total)} beneficiarios únicos en la institución, representando una cobertura del ${cob_inst_vul} de la población en condición de vulnerabilidad del estado.`);
} else {
  bullets71.push(`Se atendieron ${fmt(total)} beneficiarios únicos en la institución durante el período.`);
}

bullets71.push(`Del total de beneficiarios, ${fmt(m_tot)} son mujeres (${pct(m_tot,total)}) y ${fmt(h_tot)} son hombres (${pct(h_tot,total)})${sn_tot > 0 ? `. ${fmt(sn_tot)} registros no cuentan con dato de sexo asignado y requieren seguimiento para su correcta clasificación` : ''}.`);

bullets71.push(`Por rango de edad, la institución registra: ${fmt(ninos_t)} niños y niñas (0 a 11 años), ${fmt(jovenes_t)} jóvenes (12 a 29 años), ${fmt(adultos_t)} adultos (30 a 64 años) y ${fmt(mayores_t)} personas mayores (65 años o más). El segmento con mayor volumen de atención es el de ${grupoDom_inst.nombre} con ${fmt(grupoDom_inst.val)} beneficiarios (${pct(grupoDom_inst.val, total)}).`);

if (topProg_inst) {
  bullets71.push(`El programa con mayor número de beneficiarios es ${tcStr(topProg_inst.nombre)}, con ${fmt(topProg_inst.total)} beneficiarios registrados (${pct(topProg_inst.total, total)} del total institucional).`);
}

bullets71.push(`Se registra atención a través de ${fmt(n_progs_f)} programa${n_progs_f !== 1 ? 's' : ''} activo${n_progs_f !== 1 ? 's' : ''} en ${fmt(n_muns_f)} municipio${n_muns_f !== 1 ? 's' : ''} del estado durante el período.`);

bullets71.forEach(b => {
  children.push(new Paragraph({
    spacing: { before: 40, after: 60 },
    indent:  { left: 360 },
    children: [
      new TextRun({ text: '• ', bold: true, size: 18, color: C.azulMed, font: 'Arial' }),
      new TextRun({ text: b, size: 18, color: C.gris, font: 'Arial' }),
    ],
  }));
});
children.push(spacer(4));

// ── 7.2 Beneficiarios localizables ───────────────────────────────────────────
children.push(label('7.2  Beneficiarios localizables', { bold: true, color: C.azulMed, size: 18, border: false }));
children.push(spacer(2));

const tot_loc_inst  = loc_total_display;
const no_loc_inst   = total - tot_loc_inst;
const loc_pct_72    = pct(tot_loc_inst, total);
const no_loc_pct_72 = pct(no_loc_inst, total);

const bullets72 = [];

if (tot_loc_inst > 0) {
  bullets72.push(`Se identificaron ${fmt(tot_loc_inst)} beneficiarios localizables (${loc_pct_72} del total institucional), con datos de contacto, domicilio y ubicación completos y verificables.`);
  bullets72.push(`${fmt(no_loc_inst)} beneficiarios (${no_loc_pct_72}) no cuentan con información de localización completa, lo que representa una oportunidad de mejora en la calidad del padrón institucional.`);
  bullets72.push(`De los beneficiarios localizables, ${fmt(loc_m_display)} son mujeres (${pct(loc_m_display, tot_loc_inst)}) y ${fmt(loc_h_display)} son hombres (${pct(loc_h_display, tot_loc_inst)}), consistente con la distribución de género de la institución.`);
} else {
  bullets72.push(`No se cuenta con datos de localización registrados para los beneficiarios de esta institución en el período actual.`);
  bullets72.push(`Se recomienda capturar la información de contacto y domicilio de los beneficiarios para habilitar el seguimiento de apoyos entregados.`);
}

bullets72.forEach(b => {
  children.push(new Paragraph({
    spacing: { before: 40, after: 60 },
    indent:  { left: 360 },
    children: [
      new TextRun({ text: '• ', bold: true, size: 18, color: C.azulMed, font: 'Arial' }),
      new TextRun({ text: b, size: 18, color: C.gris, font: 'Arial' }),
    ],
  }));
});
children.push(spacer(4));

// ── 7.3 Apoyos otorgados ─────────────────────────────────────────────────────
children.push(label('7.3  Apoyos otorgados', { bold: true, color: C.azulMed, size: 18, border: false }));
children.push(spacer(2));

const apoyosPorVol_inst = [...desglose_inst].sort((a,b) => sf(b.total) - sf(a.total));
const apoyoTop_inst     = apoyos_sorted[0];
const apoyoTop2_inst    = apoyos_sorted[1];
const n_tipos_inst      = n_tipos_f;   // usa conteo filtrado cuando hayFiltro
const total_ap_conclus  = hayFiltro ? sf(total_apoyos_display) : sf(total_apoyos_inst_calc);

const bullets73 = [];

bullets73.push(`Se entregaron ${fmt(total_ap_conclus)} apoyos en la institución durante el período, distribuidos en ${n_tipos_inst} tipo${n_tipos_inst !== 1 ? 's' : ''} de apoyo registrados.`);

if (apoyoTop_inst) {
  const apoyoTopTxt = `${tcStr(apoyoTop_inst[0])} con ${fmt(apoyoTop_inst[1])} apoyos (${pct(apoyoTop_inst[1], total_ap_conclus)} del total institucional)`;
  bullets73.push(`El tipo de apoyo con mayor volumen de entregas es: ${apoyoTopTxt}.`);
}

if (apoyoTop2_inst) {
  bullets73.push(`El segundo apoyo más entregado es ${tcStr(apoyoTop2_inst[0])}, con ${fmt(apoyoTop2_inst[1])} entregas (${pct(apoyoTop2_inst[1], total_ap_conclus)}).`);
}

const ratio_inst = total > 0 ? (sf(total_ap_conclus) / total).toFixed(1) : '0';
bullets73.push(`La relación de apoyos por beneficiario único en la institución es de ${ratio_inst} apoyos por persona, lo que ${parseFloat(ratio_inst) >= 1.5 ? 'indica que varios beneficiarios reciben más de un tipo de apoyo' : 'indica una distribución mayormente de un apoyo por beneficiario'}.`);

bullets73.forEach(b => {
  children.push(new Paragraph({
    spacing: { before: 40, after: 60 },
    indent:  { left: 360 },
    children: [
      new TextRun({ text: '• ', bold: true, size: 18, color: C.azulMed, font: 'Arial' }),
      new TextRun({ text: b, size: 18, color: C.gris, font: 'Arial' }),
    ],
  }));
});
children.push(spacer(4));

// ── 7.4 Gasto estimado ───────────────────────────────────────────────────────
if (gasto_inst_est && gasto_inst_est > 0) {
  children.push(label('7.4  Gasto estimado institucional', { bold: true, color: C.azulMed, size: 18, border: false }));
  children.push(spacer(2));
  const gastoXBenef_inst = gasto_inst_est / total;
  const bullets74 = [
    `El gasto estimado para la institución ${inst_key} asciende a $${Math.round(gasto_inst_est).toLocaleString('es-MX')} MXN, calculado con base en ${progs_con_gasto} programa${progs_con_gasto !== 1 ? 's' : ''} con datos de gasto registrados.`,
    `El gasto estimado por beneficiario único en la institución es de $${Math.round(gastoXBenef_inst).toLocaleString('es-MX')} MXN.`,
    `Este estimado representa una aproximación con base en la información presupuestal disponible. Se recomienda completar el registro de gasto en todos los programas para obtener un análisis más preciso.`,
  ];
  bullets74.forEach(b => {
    children.push(new Paragraph({
      spacing: { before: 40, after: 60 },
      indent:  { left: 360 },
      children: [
        new TextRun({ text: '• ', bold: true, size: 18, color: C.azulMed, font: 'Arial' }),
        new TextRun({ text: b, size: 18, color: C.gris, font: 'Arial' }),
      ],
    }));
  });
  children.push(spacer(4));
}

// ── 7.5 Observaciones y recomendaciones ──────────────────────────────────────
const _obsNum = (gasto_inst_est && gasto_inst_est > 0) ? '7.5' : '7.4';
children.push(label(`${_obsNum}  Observaciones y recomendaciones`, { bold: true, color: C.azulMed, size: 18, border: false }));
children.push(spacer(2));

const bullets75 = [];

bullets75.push(`El padrón de beneficiarios de ${inst_key} refleja una cobertura activa a través de ${fmt(n_progs_f)} programa${n_progs_f !== 1 ? 's' : ''} en ${fmt(n_muns_f)} municipio${n_muns_f !== 1 ? 's' : ''} durante el período de reporte.`);

if (sn_tot > 0) {
  bullets75.push(`Se identifican ${fmt(sn_tot)} registros sin dato de sexo (${pct(sn_tot,total)}). Se recomienda implementar un proceso de depuración y actualización de estos registros para mejorar la calidad del padrón institucional.`);
}

if (no_loc_inst > 0 && tot_loc_inst > 0) {
  const brechaLoc_inst = no_loc_inst / total;
  if (brechaLoc_inst > 0.3) {
    bullets75.push(`La brecha de localización es significativa: ${no_loc_pct_72} de los beneficiarios no cuenta con datos de contacto completos. Se recomienda priorizar la actualización de información de localización en esta institución.`);
  } else {
    bullets75.push(`La institución presenta una tasa de localización de ${loc_pct_72}, lo que refleja una buena calidad de datos de contacto en el padrón.`);
  }
}

bullets75.push(`Se recomienda mantener la actualización periódica del padrón institucional para garantizar la correcta clasificación de beneficiarios, la entrega oportuna de apoyos y el monitoreo del desempeño en los siguientes períodos de reporte.`);

bullets75.forEach(b => {
  children.push(new Paragraph({
    spacing: { before: 40, after: 60 },
    indent:  { left: 360 },
    children: [
      new TextRun({ text: '• ', bold: true, size: 18, color: C.azulMed, font: 'Arial' }),
      new TextRun({ text: b, size: 18, color: C.gris, font: 'Arial' }),
    ],
  }));
});
children.push(spacer(6));

// ── NOTAS FINALES ─────────────────────────────────────────────────────────────
children.push(new Paragraph({
  border: { top: brd(C.grisM, 4) },
  spacing: { before: 200, after: 40 },
  children: [new TextRun({ text: `Documento generado el ${fecha_str}. Fuente: Padrón de beneficiarios — SDHyBC, Gobierno del Estado de Chihuahua.`, size: 15, color: C.gris, font: 'Arial', italics: true })],
}));

// ── Generar documento ─────────────────────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size:   { width: 12240, height: 15840 },
        margin: { top: 720, bottom: 720, left: 800, right: 800 },
      },
    },
    headers: { default: makeHeader() },
    footers: { default: makeFooter() },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT_PATH, buf);
  console.log(`Reporte institucional generado: ${OUT_PATH}  (${Math.round(buf.length/1024)} KB)`);
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
