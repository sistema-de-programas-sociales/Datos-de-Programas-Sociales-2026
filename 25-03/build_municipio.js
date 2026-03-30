#!/usr/bin/env node
/**
 * build_municipio.js — Reporte individual por municipio
 * Recibe: node build_municipio.js <data_json_path> <output_path>
 *
 * Incluye: KPIs, edad×sexo, programas×institución, apoyos detallados,
 *          tendencias por grupo poblacional, concentración por apoyo
 */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, HeadingLevel,
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

const { mun, desglose_mun, MES, ANO, fecha_str, pob_estatal, pob_vulnerable, charts = {},
        gasto_mun_est = null, progs_con_gasto = 0,
        filtros_mun = {}, filtro_activo = {} } = raw;

// ── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  azul:    '1B3A6B', azulMed: '2E5BA8', azulClar: 'D6E4F7', azulPale: 'EEF4FB',
  dorado:  'C8A000', verde:   '1A6B3C', verde_c:  'D6F0E0',
  rojo:    '8B1A1A', rojo_c:  'FAE0E0',
  gris:    '555555', grisL:   'F5F5F5', grisM:    'DDDDDD',
  blanco:  'FFFFFF', negro:   '000000',
};

// Ancho útil de página: 12240 - margen izq 800 - margen der 800 = 10640 twips
const PAGE_W = 10640;

function sf(v)  { return parseFloat(v) || 0; }
function fmt(n) { return Math.round(sf(n)).toLocaleString('es-MX'); }
function fmtMXN(n) {
  if (!n || n === 0) return '—';
  return '$' + Math.round(sf(n)).toLocaleString('es-MX');
}
function pct(a, b) {
  const d = sf(b); if (!d) return '0';
  return (sf(a) / d * 100).toFixed(1) + '%';
}
const _MIN_TC = new Set(['a','ante','bajo','con','contra','de','del','desde','durante',
  'el','en','entre','hacia','hasta','la','las','lo','los','mediante','para',
  'por','que','se','sin','sobre','su','sus','tras','un','una','unas','unos','y']);
function tcStr(s) {
  if (!s) return s;
  if (s !== s.toUpperCase()) return s;  // ya tiene minusculas, no tocar
  return s.split(' ').map((w, i) =>
    (i === 0 || !_MIN_TC.has(w.toLowerCase()))
      ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      : w.toLowerCase()
  ).join(' ');
}

// ── Bordes ────────────────────────────────────────────────────────────────────
const brd = (color = 'CCCCCC', size = 1) => ({ style: BorderStyle.SINGLE, size, color });
const borders  = { top: brd(), bottom: brd(), left: brd(), right: brd() };
const brdNone  = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const brdNones = { top: brdNone, bottom: brdNone, left: brdNone, right: brdNone };
const brdHdr   = { top: brd(C.azul,8), bottom: brd(C.azul,4), left: brdNone, right: brdNone };
const brdBot   = { top: brdNone, bottom: brd(C.azulMed,6), left: brdNone, right: brdNone };

// Escala cualquier array de anchos para que sume exactamente PAGE_W
function scaleWidths(cols) {
  const raw = cols.reduce((a,b) => a+b, 0);
  const scaled = cols.map(w => Math.floor(w * PAGE_W / raw));
  const diff = PAGE_W - scaled.reduce((a,b) => a+b, 0);
  scaled[scaled.length-1] += diff;
  return scaled;
}

// ── Fila de 4 imágenes en tabla ───────────────────────────────────────────────
// chartRow eliminado — gráficas removidas del reporte

// ── Helpers de celda ─────────────────────────────────────────────────────────
function tc(text, w, opts = {}) {
  const { bold=false, color=C.negro, fill=C.blanco, size=17,
          align=AlignmentType.LEFT, italic=false } = opts;
  return new TableCell({
    borders,
    width:    { size: w, type: WidthType.DXA },
    shading:  { fill, type: ShadingType.CLEAR },
    margins:  { top: 60, bottom: 60, left: 110, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text ?? '—'), bold, color, size, italics: italic, font: 'Arial' })],
    })],
  });
}

function tcH(text, w, fill = C.azulMed) {
  return new TableCell({
    borders,
    width:   { size: w, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 110, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: String(text), bold: true, color: C.blanco, size: 16, font: 'Arial' })],
    })],
  });
}

function hRow(cols, widths, fill = C.azulMed) {
  return new TableRow({ tableHeader: true, cantSplit: true, children: cols.map((c, i) => tcH(c, widths[i], fill)) });
}

function dRow(vals, widths, even = false, opts = []) {
  const fill = even ? C.azulPale : C.blanco;
  return new TableRow({ cantSplit: true, children: vals.map((v, i) => {
    const isNum = i > 0;
    return new TableCell({
      borders,
      width:   { size: widths[i], type: WidthType.DXA },
      shading: { fill: (opts[i] && opts[i].fill) || fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: i === 0 ? 110 : 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: isNum ? AlignmentType.RIGHT : AlignmentType.LEFT,
        keepLines: true,
        children: [new TextRun({
          text: String(v ?? '0'),
          size: 17, font: 'Arial',
          color: (opts[i] && opts[i].color) || C.gris,
          bold:  (opts[i] && opts[i].bold)  || false,
        })],
      })],
    });
  })});
}

function totRow(vals, widths) {
  return new TableRow({ cantSplit: true, children: vals.map((v, i) => new TableCell({
    borders,
    width:   { size: widths[i], type: WidthType.DXA },
    shading: { fill: C.azulClar, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: i === 0 ? 110 : 80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
      keepLines: true,
      children: [new TextRun({ text: String(v), bold: true, size: 20, font: 'Arial', color: C.azul })],
    })],
  }))});
}

// dRow con keepNext opcional — usar en la última fila de datos antes de totRow
function dRowLast(vals, widths, even = false, opts = []) {
  const fill = even ? C.azulPale : C.blanco;
  return new TableRow({ cantSplit: true, children: vals.map((v, i) => {
    const isNum = i > 0;
    return new TableCell({
      borders,
      width:   { size: widths[i], type: WidthType.DXA },
      shading: { fill: (opts[i] && opts[i].fill) || fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: i === 0 ? 110 : 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({
        alignment: isNum ? AlignmentType.RIGHT : AlignmentType.LEFT,
        keepLines: true,
        keepNext:  true,   // mantiene esta fila unida a la siguiente (TOTAL)
        children: [new TextRun({
          text: String(v ?? '0'),
          size: 17, font: 'Arial',
          color: (opts[i] && opts[i].color) || C.gris,
          bold:  (opts[i] && opts[i].bold)  || false,
        })],
      })],
    });
  })});
}

function spacer(n = 6, keepNext = false) {
  return new Paragraph({ children: [], spacing: { before: 0, after: n * 20 }, keepNext });
}

function label(text, opts = {}) {
  const { bold=true, color=C.azulMed, size=20, border=false, pageBreak=false, keepNext=true } = opts;
  const p = new Paragraph({
    spacing: { before: 80, after: 40 },
    border: border ? { bottom: brd(C.azulMed, 4) } : {},
    pageBreakBefore: pageBreak,
    keepNext,
    children: [new TextRun({ text, bold, color, size, font: 'Arial' })],
  });
  return p;
}

function body(text, keepNext = false) {
  return new Paragraph({
    spacing: { before: 0, after: 60 },
    keepNext,
    children: [new TextRun({ text, size: 18, font: 'Arial', color: C.gris })],
  });
}

// ── Header / Footer ───────────────────────────────────────────────────────────
function makeHeader(nombre) {
  return new Header({ children: [
    new Paragraph({
      border: { bottom: brd(C.azulMed, 6) },
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `REPORTE MUNICIPAL — ${nombre}`, bold: true, size: 18, color: C.azul, font: 'Arial' }),
        new TextRun({ text: `     ${MES.replace(/_/g,' ')} ${ANO}  |  SDHyBC — Gobierno del Estado de Chihuahua`, size: 16, color: C.gris, font: 'Arial' }),
      ],
    }),
  ]});
}

function makeFooter() {
  return new Footer({ children: [
    new Paragraph({
      border: { top: brd(C.azulMed, 4) },
      alignment: AlignmentType.RIGHT,
      spacing: { before: 80 },
      children: [
        new TextRun({ text: 'Página ', size: 15, color: C.gris, font: 'Arial' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 15, color: C.gris, font: 'Arial' }),
        new TextRun({ text: ' de ', size: 15, color: C.gris, font: 'Arial' }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 15, color: C.gris, font: 'Arial' }),
      ],
    }),
  ]});
}

// ── KPI box (celda 2×2 sin bordes externos) ───────────────────────────────────
function kpiCell(label_text, value, sub, w, fill = C.azulClar) {
  return new TableCell({
    borders: brdNones,
    width:   { size: w, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: value, bold: true, size: 30, color: C.azul, font: 'Arial' })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: label_text, size: 17, color: C.azulMed, font: 'Arial', bold: true })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: sub, size: 15, color: C.gris, font: 'Arial', italics: true })
      ]}),
    ],
  });
}

function kpiRow(items) {
  const w = Math.floor(PAGE_W / items.length);
  const widths = items.map((_, i) => i < items.length-1 ? w : PAGE_W - w*(items.length-1));
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [new TableRow({ children: items.map((it, i) => kpiCell(it.label, it.value, it.sub, widths[i], it.fill || C.azulClar)) })],
  });
}

// ── Datos base del municipio ─────────────────────────────────────────────────
const nombre   = mun.municipio;
const total    = sf(mun.total);
const sn_tot   = sf(mun.sn);
const m_tot    = sf(mun.m);
const h_tot    = sf(mun.h);
const pob      = sf(mun.poblacion);
const rangos   = mun.rangos || {};
const rangosMH = mun.rangos_mh || {};
const progs_d  = mun.programas_detail || [];
const insts    = mun.instituciones || [];
const n_prog   = sf(mun.n_programas);
const n_inst   = sf(mun.n_instituciones);
const tot_apoyos      = sf(mun.total_apoyos);
const tot_localizables = sf(mun.total_localizables);

const ninos_t   = sf(rangos['0-5'])   + sf(rangos['6-11']);
const jovenes_t = sf(rangos['12-17']) + sf(rangos['18-29']);
const adultos_t = sf(rangos['30-49']) + sf(rangos['50-64']);
const mayores_t = sf(rangos['65+']);
const sndatos_t = sf(rangos['sin_datos']);

// m/h por grupo de edad (del sheet 2)
function ageGroup(keys) {
  let tm=0, th=0, tt=0;
  keys.forEach(k => {
    const g = rangosMH[k] || {m:0,h:0,total:0};
    tm += sf(g.m); th += sf(g.h); tt += sf(g.total);
  });
  return {m:tm, h:th, t:tt};
}
const g_ninos   = ageGroup(['0-5','6-11']);
const g_jovenes = ageGroup(['12-17','18-29']);
const g_adultos = ageGroup(['30-49','50-64']);
const g_mayores = ageGroup(['65+']);
const g_sndatos = ageGroup(['sin_datos']);

// ── Construir secciones ───────────────────────────────────────────────────────
// Sin filtro adicional: el reader ya eliminó placeholders. Usar desglose completo.
const desglose_mun_f = desglose_mun.filter(a => sf(a.total) > 0);
// Recalcular tot_apoyos desde desglose para garantizar consistencia KPI ↔ tabla
const tot_apoyos_calc = desglose_mun_f.reduce((s, a) => s + sf(a.total), 0);
const children = [];

// ── 1. PORTADA del municipio ─────────────────────────────────────────────────
// Encabezado azul con nombre del municipio
children.push(new Paragraph({
  spacing: { before: 0, after: 0 },
  shading: { fill: C.azul, type: ShadingType.CLEAR },
  border:  { bottom: brd(C.dorado, 10) },
  children: [
    new TextRun({ text: `  ${tcStr(nombre)}`, bold: true, size: 40, color: C.blanco, font: 'Arial' }),
  ],
}));
children.push(new Paragraph({
  spacing: { before: 0, after: 100 },
  children: [
    new TextRun({ text: `Reporte de Beneficiarios  ·  ${MES.replace(/_/g,' ')} ${ANO}  ·  Secretaría de Desarrollo Humano y Bien Común`, size: 17, color: C.gris, font: 'Arial' }),
  ],
}));

// ── KPIs en tabla 2×4 (para que quepan en la primera página) ─────────────────
children.push(label('Indicadores clave del municipio', { border: true }));
children.push(spacer(2));
// Fila 1: Beneficiarios y cobertura municipal
children.push(kpiRow([
  { label: 'Beneficiarios únicos',  value: fmt(total),                                   sub: 'personas atendidas' },
  { label: 'Mujeres',              value: `${fmt(m_tot)} (${pct(m_tot,total)})`,         sub: 'del total' },
  { label: 'Hombres',             value: `${fmt(h_tot)} (${pct(h_tot,total)})`,          sub: 'del total' },
  { label: 'Sin dato de sexo',    value: `${fmt(sn_tot)} (${pct(sn_tot,total)})`,        sub: 'del total',               fill: C.azulPale },
  { label: 'Cobertura municipal', value: pct(total, pob),                                sub: pob>0?`de ${fmt(pob)} hab.`:'sin dato de población', fill: C.verde_c },
]));
children.push(spacer(3));
// Fila 2: Actividad y cobertura estatal
children.push(kpiRow([
  { label: 'Apoyos entregados',    value: fmt(tot_apoyos_calc),                          sub: 'total en el período' },
  { label: 'Programas activos',    value: fmt(n_prog),                                   sub: `en ${fmt(n_inst)} ${n_inst!==1?'instituciones':'institución'}` },
  { label: 'Cobertura estatal',    value: pct(total, pob_estatal),                       sub: 'del total del estado',    fill: C.verde_c },
  { label: 'Cobertura vulnerable', value: pct(total, pob_vulnerable),                    sub: 'de pob. vulnerable estatal', fill: C.verde_c },
]));
children.push(spacer(3));
// Fila 3: Localizables
children.push(kpiRow([
  { label: 'Beneficiarios localizables', value: fmt(tot_localizables),
    sub: tot_localizables > 0 ? `${pct(tot_localizables, total)} de beneficiarios únicos` : 'sin datos de localización',
    fill: tot_localizables > 0 ? C.verde_c : C.azulPale },
  { label: 'Mujeres localizables',  value: fmt(sf(mun.loc_m)),
    sub: sf(mun.loc_m) > 0 ? `${pct(sf(mun.loc_m), tot_localizables)} del total localizable` : '—' },
  { label: 'Hombres localizables',  value: fmt(sf(mun.loc_h)),
    sub: sf(mun.loc_h) > 0 ? `${pct(sf(mun.loc_h), tot_localizables)} del total localizable` : '—' },
]));
children.push(spacer(3));
// Fila 4: Gasto estimado
children.push(kpiRow([
  { label: 'Gasto estimado municipal',    value: fmtMXN(gasto_mun_est),
    sub: gasto_mun_est > 0
      ? `estimado sobre ${progs_con_gasto} programa${progs_con_gasto!==1?'s':''} con gasto registrado`
      : 'sin datos de gasto disponibles',
    fill: gasto_mun_est > 0 ? C.verde_c : C.azulPale },
  { label: 'Gasto est. por beneficiario', value: gasto_mun_est > 0 ? fmtMXN(gasto_mun_est / total) : '—',
    sub: gasto_mun_est > 0 ? 'promedio por beneficiario único' : 'sin datos de gasto' },
]));
children.push(spacer(2));




// ── ÍNDICE DE CONTENIDOS ──────────────────────────────────────────────────────
{
  // Estimación de páginas por sección basada en contenido real
  const nProgs = progs_d.length;
  const apoyosConEdadCount = desglose_mun_f.filter(a => Object.values(a.rangos||{}).some(v=>sf(v.total)>0)).length;

  const pg = {};
  pg.kpi    = 1;
  pg.indice = 2;
  pg.s1     = 3;
  pg.s2     = pg.s1 + 1 + Math.ceil(nProgs / 12);
  pg.s3     = pg.s2 + 1 + Math.ceil(nProgs / 10);
  pg.s4     = pg.s3 + 1 + Math.ceil(nProgs / 6);
  pg.s5     = pg.s4 + 1 + Math.ceil(nProgs / 4);
  pg.s6     = pg.s5 + 1 + Math.ceil(apoyosConEdadCount / 5);
  pg.s7     = pg.s6 + 1;

  children.push(new Paragraph({
    pageBreakBefore: true,
    spacing: { before: 0, after: 100 },
    shading: { fill: C.azul, type: ShadingType.CLEAR },
    border: { bottom: brd(C.dorado, 8) },
    children: [
      new TextRun({ text: `  Índice de Contenidos`, bold: true, size: 36, color: C.blanco, font: 'Arial' }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { before: 0, after: 160 },
    children: [new TextRun({ text: `${tcStr(nombre)}  ·  ${MES.replace(/_/g,' ')} ${ANO}`, size: 17, color: C.gris, font: 'Arial' })],
  }));

  // Definir entradas del índice
  const indexSections = [
    { pg: pg.kpi,   title: 'Indicadores clave del municipio (KPIs)',             tipo: 'Sección',    sec: '—' },
    { pg: pg.indice,title: 'Índice de contenidos',                               tipo: 'Sección',    sec: '—' },
    { pg: pg.s1,    title: 'Distribución por grupo de edad y sexo',              tipo: 'Sección',    sec: '1' },
    { pg: pg.s1,    title: 'Gráfica: Distribución por sexo',                     tipo: 'Gráfica',    sec: '1' },
    { pg: pg.s1,    title: 'Gráfica: Distribución por grupo de edad',            tipo: 'Gráfica',    sec: '1' },
    { pg: pg.s1,    title: 'Gráfica: Pirámide por edad y sexo',                  tipo: 'Gráfica',    sec: '1' },
    { pg: pg.s2,    title: 'Beneficiarios localizables',                         tipo: 'Sección',    sec: '2' },
    { pg: pg.s2,    title: 'Tabla: Localizables por programa',                   tipo: 'Tabla',      sec: '2' },
    { pg: pg.s2,    title: 'Gráfica: Beneficiarios únicos vs localizables',      tipo: 'Gráfica',    sec: '2' },
    { pg: pg.s3,    title: 'Beneficiarios por programa e institución',           tipo: 'Sección',    sec: '3' },
    { pg: pg.s3,    title: 'Tabla: Programas activos en el municipio',           tipo: 'Tabla',      sec: '3' },
    { pg: pg.s3,    title: 'Tabla: Instituciones presentes en el municipio',     tipo: 'Tabla',      sec: '3' },
    { pg: pg.s4,    title: 'Apoyos otorgados (todos los tipos)',                 tipo: 'Sección',    sec: '4' },
    { pg: pg.s4,    title: 'Gráfica: Distribución de apoyos por tipo',           tipo: 'Gráfica',    sec: '4' },
    { pg: pg.s4,    title: 'Tabla: Detalle de apoyos por tipo',                  tipo: 'Tabla',      sec: '4' },
    { pg: pg.s5,    title: 'Detalle de apoyos por programa',                     tipo: 'Sección',    sec: '5' },
    { pg: pg.s5,    title: 'Tablas: Apoyos desglosados por cada programa',       tipo: 'Tabla',      sec: '5' },
    { pg: pg.s6,    title: 'Análisis y observaciones',                           tipo: 'Sección',    sec: '6' },
    { pg: pg.s6,    title: '7.1  Cobertura y alcance del municipio',             tipo: 'Subsección', sec: '7.1' },
    { pg: pg.s6,    title: '7.2  Beneficiarios localizables',                    tipo: 'Subsección', sec: '7.2' },
    { pg: pg.s6,    title: '7.3  Apoyos otorgados',                              tipo: 'Subsección', sec: '7.3' },
    ...(gasto_mun_est > 0 ? [{ pg: pg.s6, title: '7.4  Gasto estimado municipal', tipo: 'Subsección', sec: '7.4' }] : []),
    { pg: pg.s6,    title: '7.4  Observaciones y recomendaciones',               tipo: 'Subsección', sec: '7.4' },
  ];

  // Color por tipo
  const tipoBadgeColor = { 'Sección': C.azulMed, 'Subsección': C.azulClar, 'Gráfica': '1A6B3C', 'Tabla': 'C8A000' };
  const tipoBadgeFg    = { 'Sección': C.blanco,  'Subsección': C.azulMed,  'Gráfica': C.blanco,  'Tabla':  C.blanco };

  const idxW = scaleWidths([600, 6400, 1500, 1000]);
  const idxRows = [
    new TableRow({ tableHeader: true, children: [
      new TableCell({ borders, width:{size:idxW[0],type:WidthType.DXA}, shading:{fill:C.azul,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80},
        children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Pág.',bold:true,size:16,color:C.blanco,font:'Arial'})]})] }),
      new TableCell({ borders, width:{size:idxW[1],type:WidthType.DXA}, shading:{fill:C.azul,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:110,right:80},
        children:[new Paragraph({children:[new TextRun({text:'Contenido',bold:true,size:16,color:C.blanco,font:'Arial'})]})] }),
      new TableCell({ borders, width:{size:idxW[2],type:WidthType.DXA}, shading:{fill:C.azul,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80},
        children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Tipo',bold:true,size:16,color:C.blanco,font:'Arial'})]})] }),
      new TableCell({ borders, width:{size:idxW[3],type:WidthType.DXA}, shading:{fill:C.azul,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:80,right:80},
        children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Sec.',bold:true,size:16,color:C.blanco,font:'Arial'})]})] }),
    ]}),
    ...indexSections.map((entry, i) => {
      const fill = i % 2 === 0 ? C.blanco : C.azulPale;
      const badgeFill = tipoBadgeColor[entry.tipo] || C.azulMed;
      const badgeFg   = tipoBadgeFg[entry.tipo]    || C.blanco;
      const isSubsec  = entry.tipo === 'Subsección';
      return new TableRow({ cantSplit: true, children: [
        new TableCell({ borders, width:{size:idxW[0],type:WidthType.DXA}, shading:{fill,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:80,right:80},
          children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:String(entry.pg),bold:true,size:16,color:C.azul,font:'Arial'})]})] }),
        new TableCell({ borders, width:{size:idxW[1],type:WidthType.DXA}, shading:{fill,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:isSubsec?220:110,right:80},
          children:[new Paragraph({children:[new TextRun({text:entry.title,size:17,color:C.gris,font:'Arial',bold:entry.tipo==='Sección'})]})] }),
        new TableCell({ borders, width:{size:idxW[2],type:WidthType.DXA}, shading:{fill:badgeFill,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:60,right:60},
          children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:entry.tipo,size:14,color:badgeFg,font:'Arial',bold:true})]})] }),
        new TableCell({ borders, width:{size:idxW[3],type:WidthType.DXA}, shading:{fill,type:ShadingType.CLEAR}, margins:{top:60,bottom:60,left:80,right:80},
          children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:entry.sec,size:16,color:C.azulMed,font:'Arial',bold:true})]})] }),
      ]});
    }),
  ];

  children.push(new Table({ width:{size:PAGE_W,type:WidthType.DXA}, columnWidths:idxW, rows:idxRows }));
  children.push(spacer(6));
}

// Barra horizontal: Mujeres vs Hombres
function miniBar(labelA, valA, labelB, valB, colorA, colorB) {
  const tot = sf(valA) + sf(valB);
  const pA  = tot > 0 ? Math.round(sf(valA) / tot * 100) : 50;
  const pB  = 100 - pA;
  const wA  = Math.round(PAGE_W * pA / 100);
  const wB  = PAGE_W - wA;
  function barCell(text, w, fill) {
    return new TableCell({
      borders: brdNones,
      width: { size: w, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text, bold: true, size: 17, color: 'FFFFFF', font: 'Arial' })
      ]})],
    });
  }
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: [wA, wB],
    rows: [new TableRow({ children: [
      barCell(`${labelA}  ${pA}%`, wA, colorA),
      barCell(`${pB}%  ${labelB}`, wB, colorB),
    ]})],
  });
}

// Barra: distribución por grupo de edad (5 segmentos)
function miniBarAge() {
  const groups = [
    { label: '0–11',  val: ninos_t,   color: '1B3A6B' },
    { label: '12–29', val: jovenes_t, color: '2E5BA8' },
    { label: '30–64', val: adultos_t, color: '4A7FC1' },
    { label: '65+',   val: mayores_t, color: '6B9FD4' },
    { label: 'S/D',  val: sndatos_t, color: '999999' },
  ];
  const tot = groups.reduce((s, g) => s + g.val, 0) || 1;
  const widths = groups.map((g, i) => {
    const w = Math.round(PAGE_W * g.val / tot);
    return Math.max(w, g.val > 0 ? 200 : 0);
  });
  // Normalize to exactly PAGE_W
  const wSum = widths.reduce((a,b)=>a+b,0);
  if (wSum > 0) widths[widths.length-1] += (PAGE_W - wSum);
  const activeCols = groups.filter((g,i) => widths[i] > 0);
  const activeWidths = widths.filter(w => w > 0);
  if (activeCols.length === 0) return spacer(4);
  return new Table({
    width: { size: PAGE_W, type: WidthType.DXA },
    columnWidths: activeWidths,
    rows: [new TableRow({ children: activeCols.map((g, i) => new TableCell({
      borders: brdNones,
      width: { size: activeWidths[i], type: WidthType.DXA },
      shading: { fill: g.color, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: g.label, bold: true, size: 15, color: 'FFFFFF', font: 'Arial' })
      ]})],
    }))})],
  });
}


// Helper: fila de datos con celdas más altas (sección 1)
function dRowTall(vals, wds, even=true) {
  return new TableRow({ cantSplit: false, children: vals.map((v, i) => new TableCell({
    borders,
    width: { size: wds[i], type: WidthType.DXA },
    shading: { fill: even ? C.blanco : C.azulPale, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: i===0?110:80, right: 80 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: i===0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
      children: [new TextRun({ text: String(v), size: 18, color: C.gris, font: 'Arial' })] })],
  }))});
}
// ── 3. DISTRIBUCIÓN POR EDAD Y SEXO ─────────────────────────────────────────
children.push(label('1. Distribución por grupo de edad y sexo', { border: true, pageBreak: true }));
children.push(body('Beneficiarios únicos del municipio clasificados por grupo etario con desglose por sexo.', true));
children.push(spacer(4, true));

const edWF = scaleWidths([1900, 1060, 1060, 1060, 1060, 1060, 1060, 1060]); // col edad más ancha
children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: edWF,
  rows: [
    hRow(['Grupo de Edad','Beneficiarios','% del Total','Mujeres','% Mujeres','Hombres','% Hombres','S/D Sexo'], edWF, C.azulMed),
    ...[
      ['Niños (0 a 11 años)',           ninos_t,   g_ninos.m,   g_ninos.h],
      ['Jóvenes (12 a 29 años)',        jovenes_t, g_jovenes.m, g_jovenes.h],
      ['Adultos (30 a 64 años)',        adultos_t, g_adultos.m, g_adultos.h],
      ['Adultos Mayores (65+)',  mayores_t, g_mayores.m, g_mayores.h],
      ['Sin dato de edad',       sndatos_t, g_sndatos.m, g_sndatos.h],
    ].map(([g, t, m, h], i) => dRowTall([
      g, fmt(t), pct(t,total),
      fmt(m), pct(m,t),
      fmt(h), pct(h,t),
      fmt(Math.max(0, sf(t) - sf(m) - sf(h))),
    ], edWF, i%2===0)),
    totRow(['TOTAL', fmt(total), '100%', fmt(m_tot), pct(m_tot,total), fmt(h_tot), pct(h_tot,total), fmt(sn_tot)], edWF),
  ],
}));
children.push(spacer(10));

// ── Sección 1b: Desglose por institución, sexo y grupo de edad ───────────────
{
  const fa = filtro_activo || {};
  const sexoLabel1b   = fa.sexo === 'm' ? 'Mujeres' : fa.sexo === 'h' ? 'Hombres' : null;
  const rangosLabel1b = fa.rangos && fa.rangos.length ? fa.rangos.join(', ') + ' años' : null;
  const filtroLabel1b = [sexoLabel1b, rangosLabel1b].filter(Boolean).join(' · ');
  const sec1bTitle    = filtroLabel1b
    ? `1b. Desglose por institución, sexo y grupo de edad  [Filtro: ${filtroLabel1b}]`
    : '1b. Desglose por institución, sexo y grupo de edad';
  children.push(label(sec1bTitle, { border: true, pageBreak: true }));
}
children.push(body('Beneficiarios del municipio clasificados por institución, sexo y grupo de edad. Permite identificar qué segmento poblacional atiende cada dependencia.', true));
children.push(spacer(4, true));
{
  const RANGOS_ORDEN_1B = ['0-5','6-11','12-17','18-29','30-49','50-64','65+'];
  const RANGOS_LABELS_1B = {
    '0-5':'0-5','6-11':'6-11','12-17':'12-17','18-29':'18-29',
    '30-49':'30-49','50-64':'50-64','65+':'65+',
  };

  const instKeys = Object.keys(filtros_mun).filter(ik => {
    const tot = filtros_mun[ik]._totales || {};
    return sf(tot.total) > 0;
  }).sort((a, b) => sf((filtros_mun[b]._totales||{}).total) - sf((filtros_mun[a]._totales||{}).total));

  if (instKeys.length === 0) {
    children.push(body('No hay datos de desglose por institución disponibles para este municipio.'));
  } else {
    // Tabla resumen: Institución | M total | H total | 0-5 M | 0-5 H | 6-11 M | 6-11 H | ... | Total
    // Para no sobrepasar el ancho de página, mostramos M+H por rango en una sola celda (total del rango)
    const rW = scaleWidths([16, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 10]);
    const rHdrs = ['Institución', 'M total', 'H total',
                   '0-5', '6-11', '12-17', '18-29', '30-49', '50-64', '65+', 'Sin dato', 'Total'];
    const rRows = [hRow(rHdrs, rW)];

    for (const [ri, ik] of instKeys.entries()) {
      const rd  = filtros_mun[ik];
      const tot = rd._totales || {};
      const rangoCols = [...RANGOS_ORDEN_1B, 'sin_datos'].map(k => {
        const rv = rd[k] || {};
        return fmt(sf(rv.total) || sf(rv.m) + sf(rv.h));
      });
      rRows.push(dRow([
        ik, fmt(tot.m), fmt(tot.h),
        ...rangoCols,
        fmt(tot.total),
      ], rW, ri % 2 === 0));
    }

    // Fila TOTAL
    const totCols = [...RANGOS_ORDEN_1B, 'sin_datos'].map(k =>
      fmt(instKeys.reduce((s, ik) => {
        const rv = filtros_mun[ik][k] || {};
        return s + sf(rv.total || (rv.m||0) + (rv.h||0));
      }, 0))
    );
    rRows.push(totRow([
      'TOTAL',
      fmt(instKeys.reduce((s,ik) => s + sf((filtros_mun[ik]._totales||{}).m), 0)),
      fmt(instKeys.reduce((s,ik) => s + sf((filtros_mun[ik]._totales||{}).h), 0)),
      ...totCols,
      fmt(instKeys.reduce((s,ik) => s + sf((filtros_mun[ik]._totales||{}).total), 0)),
    ], rW));

    children.push(new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: rW, rows: rRows }));
    children.push(spacer(6));

    // Tablas detalladas por institución — rango exacto × M/H
    for (const ik of instKeys) {
      const rd  = filtros_mun[ik];
      const tot = rd._totales || {};
      if (sf(tot.total) === 0) continue;

      children.push(new Paragraph({ spacing: { before: 80, after: 40 }, keepNext: true,
        children: [new TextRun({ text: ik, bold: true, size: 19, color: C.azulMed, font: 'Arial' })] }));

      const dW2 = scaleWidths([26, 15, 15, 15, 14, 15]);
      const dRows2 = [hRow(['Rango de edad', 'Mujeres', 'Hombres', 'Total', '% Mujeres', '% Hombres'], dW2)];
      const RANGOS_DET = [
        ...RANGOS_ORDEN_1B.map(k => ({ key: k, label: k + ' años' })),
        { key: 'sin_datos', label: 'Sin dato de edad' },
      ];
      let ri2 = 0;
      for (const { key, label: rl } of RANGOS_DET) {
        const rv = rd[key] || {};
        const rm = sf(rv.m); const rh = sf(rv.h); const rt = sf(rv.total) || rm + rh;
        if (rt === 0) continue;
        dRows2.push(dRow([rl, fmt(rm), fmt(rh), fmt(rt), pct(rm, rt), pct(rh, rt)], dW2, ri2++ % 2 === 0));
      }
      dRows2.push(totRow(['TOTAL', fmt(tot.m), fmt(tot.h), fmt(tot.total),
        pct(tot.m, tot.total), pct(tot.h, tot.total)], dW2));
      children.push(new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: dW2, rows: dRows2 }));
      children.push(spacer(4));
    }
  }
}
children.push(spacer(6));

// ── Sección 2: Beneficiarios Localizables del municipio ─────────────────────
children.push(label('2. Beneficiarios localizables', { border: true, pageBreak: true }));
children.push(body('Cuentan como beneficiarios localizables aquellos que tienen nombre(s), apellido(s), género, fecha de nacimiento, curp, municipio, código postal y teléfono).', true));
children.push(spacer(4, true));
{
  const tot_loc   = sf(mun.total_localizables);
  const loc_m_n   = sf(mun.loc_m);
  const loc_h_n   = sf(mun.loc_h);
  const no_loc    = total - tot_loc;
  const loc_pct   = total > 0 ? (tot_loc/total*100).toFixed(1)+'%' : '—';
  const no_loc_pct= total > 0 ? (no_loc/total*100).toFixed(1)+'%' : '—';

  // KPIs — siempre visibles aunque sean cero
  children.push(kpiRow([
    { label: 'Beneficiarios localizables', value: fmt(tot_loc),
      sub: tot_loc > 0 ? `${loc_pct} del total del municipio` : 'sin datos de localización',
      fill: tot_loc > 0 ? C.verde_c : C.azulPale },
    { label: 'Mujeres localizables',  value: fmt(loc_m_n),
      sub: tot_loc > 0 ? `${pct(loc_m_n, tot_loc)} del total localizable` : '—' },
    { label: 'Hombres localizables',  value: fmt(loc_h_n),
      sub: tot_loc > 0 ? `${pct(loc_h_n, tot_loc)} del total localizable` : '—' },
    { label: 'No localizables', value: fmt(no_loc),
      sub: `${no_loc_pct} sin datos de localización`, fill: C.azulPale },
  ]));
  children.push(spacer(3));

  // Tabla de localizables por programa — siempre visible
  {
    children.push(new Paragraph({ spacing:{before:40,after:20}, keepNext: true,
      children:[new TextRun({text:'Localizables por programa',bold:true,size:18,color:C.azulMed,font:'Arial'})]}));
    const lpW = scaleWidths([3800, 900, 900, 900, 900, 900, 900]);
    const lpRows = [hRow(['Programa','Institución','Total benef.','Localizables','Mujeres loc.','Hombres loc.','% Localiz.'], lpW, C.azulMed)];
    const progsConLoc = [...progs_d].sort((a,b) => sf(b.loc_total||0) - sf(a.loc_total||0));
    if (progsConLoc.length > 0) {
      progsConLoc.forEach((p, i) => {
        const pLocTot = sf(p.loc_total || 0);
        const pLocM   = sf(p.loc_m || 0);
        const pLocH   = sf(p.loc_h || 0);
        lpRows.push(dRow([
          tcStr(p.nombre), p.institucion || '—',
          fmt(p.total), fmt(pLocTot), fmt(pLocM), fmt(pLocH),
          p.total > 0 ? (pLocTot/p.total*100).toFixed(1)+'%' : '—',
        ], lpW, i%2===0));
      });
    } else {
      lpRows.push(dRow(['Sin programas registrados','—','0','0','0','0','—'], lpW, false));
    }
    lpRows.push(totRow([`TOTAL (${progsConLoc.length} programas)`, '', fmt(total), fmt(tot_loc), fmt(loc_m_n), fmt(loc_h_n), loc_pct], lpW));
    children.push(new Table({ width:{size:PAGE_W,type:WidthType.DXA}, columnWidths:lpW, rows:lpRows }));
    children.push(spacer(3));

    children.push(spacer(4));
  }
}
children.push(spacer(6));

// ── 4. DETALLE POR PROGRAMA E INSTITUCIÓN ────────────────────────────────────
children.push(label('3. Beneficiarios por programa e institución', { border: true, pageBreak: true }));
children.push(body(`Los ${Math.round(n_prog)} programas activos en ${nombre} con beneficiarios registrados en el período.`));
children.push(spacer(4));

// ── Tabla 1: Programas ────────────────────────────────────────────────────────
children.push(body(`Programas (${Math.round(n_prog)} programas):`, true));
children.push(spacer(3, true));
const pwFF = scaleWidths([3800, 800, 700, 700, 700, 700, 700, 700, 560]);

children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: pwFF,
  rows: [
    hRow(['Programa','Institución','Total','S/D Sexo','Mujeres','Hombres','% Mujeres','% Hombres','% Municipio'], pwFF, C.azul),
    ...[...progs_d].sort((a,b) => b.total - a.total).map((p, i) => dRow([
      tcStr(p.nombre),
      p.institucion || '—',
      fmt(p.total), fmt(p.sn || 0), fmt(p.m), fmt(p.h),
      pct(p.m, p.total), pct(p.h, p.total),
      pct(p.total, total),
    ], pwFF, i%2===0)),
    totRow([`TOTAL PROGRAMAS (${Math.round(n_prog)})`, '', fmt(total), fmt(sn_tot), fmt(m_tot), fmt(h_tot), pct(m_tot,total), pct(h_tot,total), '100%'], pwFF),
  ],
}));
children.push(spacer(8));

// ── Tabla 2: Instituciones ────────────────────────────────────────────────────
// Usa inst_subtotales (fila directa Sheet2 por institución) para totales correctos.
// programas_detail se usa solo para contar n_prog por institución.
const instSub = mun.inst_subtotales || {};
const progCountByInst = {};
progs_d.forEach(p => {
  const key = p.institucion || '—';
  progCountByInst[key] = (progCountByInst[key] || 0) + 1;
});
// Combinar: totales desde inst_subtotales, n_prog desde programas_detail
const instMap = {};
Object.entries(instSub).forEach(([instNombre, v]) => {
  instMap[instNombre] = {
    m:      sf(v.m),
    h:      sf(v.h),
    sn:     sf(v.sn || 0),
    total:  sf(v.total),
    n_prog: progCountByInst[instNombre] || 0,
  };
});
// Agregar instituciones que estén en progs_d pero no en inst_subtotales (fallback)
progs_d.forEach(p => {
  const key = p.institucion || '—';
  if (!instMap[key]) instMap[key] = { m: 0, h: 0, sn: 0, total: 0, n_prog: 0 };
  if (!instSub[key]) {  // solo si no vino de inst_subtotales
    instMap[key].m      += p.m     || 0;
    instMap[key].h      += p.h     || 0;
    instMap[key].sn     += p.sn    || 0;
    instMap[key].total  += p.total || 0;
    instMap[key].n_prog += 1;
  }
});
const instList = Object.entries(instMap)
  .sort((a, b) => b[1].total - a[1].total);
const n_inst_real = instList.length;

children.push(body(`Instituciones (${n_inst_real} ${n_inst_real !== 1 ? 'instituciones' : 'institución'}) — totales directos de la hoja de beneficiarios:`, true));
children.push(spacer(3, true));
const iwFF = scaleWidths([2800, 700, 700, 700, 700, 700, 700, 780]);

children.push(new Table({
  width: { size: PAGE_W, type: WidthType.DXA },
  columnWidths: iwFF,
  rows: [
    hRow(['Institución','Programas','Total','S/D sexo','Mujeres','Hombres','% Mujeres','% Hombres'], iwFF, C.azulMed),
    ...instList.map(([instNombre, v], i) => dRow([
      instNombre,
      fmt(v.n_prog),
      fmt(v.total), fmt(v.sn), fmt(v.m), fmt(v.h),
      pct(v.m, v.total), pct(v.h, v.total),
    ], iwFF, i%2===0)),
    totRow([`TOTAL INSTITUCIONES (${n_inst_real})`, '', fmt(total), fmt(sn_tot), fmt(m_tot), fmt(h_tot), pct(m_tot,total), pct(h_tot,total)], iwFF),
  ],
}));
children.push(spacer(8));



// ── SECCIÓN 3: DISTRIBUCIÓN POR EDAD Y SEXO POR PROGRAMA ────────────────────
if (progs_d.length > 0) {
  children.push(label('4. Distribución por edad y sexo por programa', { border: true, pageBreak: true }));
  children.push(body('Desglose por edad y sexo para cada programa activo en el municipio.', true));
  children.push(spacer(4, true));

  [...progs_d].sort((a,b) => b.total - a.total).forEach((prog, pi) => {
    const pr = prog.rangos || {};
    const GRUPOS = [
      ['Niños (0 a 11 años)',         ['0-5','6-11']],
      ['Jóvenes (12 a 29 años)',      ['12-17','18-29']],
      ['Adultos (30 a 64 años)', ['30-49','50-64']],
      ['Adultos mayores (65 años o más)', ['65+']],
      ['Sin dato de edad', ['sin_datos']],
    ];

    const haData = GRUPOS.some(([,keys]) => keys.some(k => sf((pr[k]||{total:0}).total) > 0));
    if (!haData) return;

    // Encabezado del programa
    const headParaProg = new Paragraph({
      spacing: { before: 0, after: 30 },
      children: [
        new TextRun({ text: `  ${tcStr(prog.nombre)}`, bold: true, size: 18, color: C.blanco, font: 'Arial' }),
        new TextRun({ text: `  (${prog.institucion})  —  ${fmt(prog.total)} beneficiarios`, size: 16, color: C.blanco, font: 'Arial' }),
      ],
      shading: { fill: C.azulMed, type: ShadingType.CLEAR },
    });

    const pgW3 = scaleWidths([3360, 1200, 1200, 1200, 1200, 1200]);
    const dataRowsProg = GRUPOS.map(([gLabel, keys], i) => {
      let t=0, m=0, h=0;
      keys.forEach(k => { const g=pr[k]||{m:0,h:0,total:0}; t+=sf(g.total); m+=sf(g.m); h+=sf(g.h); });
      if (t === 0) return null;
      return { vals: [gLabel, fmt(t), pct(t,prog.total), fmt(m), fmt(h), pct(m,t)], even: i%2===0 };
    }).filter(Boolean);

    const innerTableProg = new Table({
      width: { size: PAGE_W, type: WidthType.DXA },
      columnWidths: pgW3,
      rows: [
        hRow(['Grupo de edad','Total','% del total','Mujeres','Hombres','% Mujeres'], pgW3, C.azulMed),
        ...dataRowsProg.map((r, ri) =>
          ri === dataRowsProg.length - 1
            ? dRowLast(r.vals, pgW3, r.even)
            : dRow(r.vals, pgW3, r.even)
        ),
        totRow(['TOTAL', fmt(prog.total), '100%', fmt(prog.m), fmt(prog.h), pct(prog.m,prog.total)], pgW3),
      ],
    });

    // Tabla contenedora de 1 celda: evita que encabezado+tabla se separen entre páginas
    children.push(new Table({
      width: { size: PAGE_W, type: WidthType.DXA },
      columnWidths: [PAGE_W],
      margins: { top: pi === 0 ? 0 : 200, bottom: 0, left: 0, right: 0 },
      rows: [new TableRow({
        cantSplit: true,
        children: [new TableCell({
          borders: brdNones,
          width: { size: PAGE_W, type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          children: [headParaProg, innerTableProg],
        })],
      })],
    }));
    children.push(spacer(4));
  });
}

// ── SECCIÓN 4: APOYOS ENTREGADOS — DETALLE COMPLETO ─────────────────────────
const n_tipos  = new Set(desglose_mun_f.map(a => a.apoyo)).size;
const n_combos = desglose_mun_f.length;
children.push(label('5. Apoyos entregados — Desglose completo', { border: true, pageBreak: true }));
children.push(body(`${n_tipos} tipo${n_tipos!==1?'s':''} de apoyo entregados en ${nombre} durante ${MES.replace(/_/g,' ')} ${ANO}  (${n_combos} combinaciones apoyo-institución-programa).`, true));
children.push(spacer(4, true));

if (desglose_mun_f.length > 0) {
  const apHeaders = ['Tipo de apoyo', 'Institución / Programa', 'Total', 'Mujeres', 'Hombres', '% Municipio'];
  const apW = scaleWidths([2400, 3700, 700, 700, 700, 860]);

  // Agrupar por tipo de apoyo — 1 fila por apoyo
  const apMap = {};
  desglose_mun_f.forEach(a => {
    const k = a.apoyo;
    if (!apMap[k]) apMap[k] = { apoyo: k, combos: new Set(), m: 0, h: 0, total: 0 };
    const inst = a.institucion || '—';
    const prog = tcStr(a.programa || '—');
    apMap[k].combos.add(`${inst} · ${prog}`);
    apMap[k].m     += sf(a.m);
    apMap[k].h     += sf(a.h);
    apMap[k].total += sf(a.total);
  });
  const apFlat = Object.values(apMap).sort((a, b) => b.total - a.total);

  const apRows = [hRow(apHeaders, apW, C.azul)];
  apFlat.forEach((r, i) => {
    const fill    = i % 2 === 0 ? C.blanco : C.azulPale;
    const pct_a   = tot_apoyos_calc > 0 ? (r.total / tot_apoyos_calc * 100).toFixed(1) + '%' : '—';
    const combos  = [...r.combos].sort();

    // Celda col 0: tipo de apoyo
    const cellApoyo = new TableCell({
      borders, width: { size: apW[0], type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 110, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [
        new TextRun({ text: tcStr(r.apoyo), size: 17, color: C.gris, font: 'Arial' }),
      ]})],
    });

    // Celda col 1: inst · prog, una línea por combo
    const comboChildren = combos.map((c, ci) => new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: ci === 0 ? 0 : 40, after: 0 },
      children: [
        new TextRun({ text: combos.length > 1 ? '• ' : '', bold: true, size: 16, color: C.azulMed, font: 'Arial' }),
        new TextRun({ text: c, size: 16, color: C.gris, font: 'Arial', italics: combos.length > 1 }),
      ],
    }));
    const cellCombo = new TableCell({
      borders, width: { size: apW[1], type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 100, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      children: comboChildren,
    });

    // Celdas numéricas
    const nums = [fmt(r.total), fmt(r.m), fmt(r.h), pct_a];
    const numCells = nums.map((val, ci) => new TableCell({
      borders, width: { size: apW[ci + 2], type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: val, size: 17, color: C.gris, font: 'Arial' }),
      ]})],
    }));

    apRows.push(new TableRow({ cantSplit: true, children: [cellApoyo, cellCombo, ...numCells] }));
  });
  apRows.push(totRow(['TOTAL APOYOS', '', fmt(tot_apoyos_calc), fmt(m_tot), fmt(h_tot), '100%'], apW));

  children.push(new Table({ width: { size: PAGE_W, type: WidthType.DXA }, columnWidths: apW, rows: apRows }));
  children.push(spacer(10));
}

// ── SECCIÓN 5: DISTRIBUCIÓN POR EDAD Y SEXO POR TIPO DE APOYO ───────────────
const apoyosConEdad = desglose_mun_f.filter(a => {
  const r = a.rangos || {};
  return Object.values(r).some(v => sf(v.total) > 0);
});

if (apoyosConEdad.length > 0) {
  
children.push(label('6. Distribución por edad y sexo por tipo de apoyo', { border: true, pageBreak: true }));
  children.push(body('Desglose por edad y sexo para cada tipo de apoyo entregado en el municipio.', true));
  children.push(spacer(4, true));

  const GRUPOS_A = [
    ['Niños (0 a 11 años)',         ['0-5','6-11']],
    ['Jóvenes (12 a 29 años)',      ['12-17','18-29']],
    ['Adultos (30 a 64 años)', ['30-49','50-64']],
    ['Adultos mayores (65 años o más)', ['65+']],
    ['Sin dato de edad', ['sin_datos']],
  ];
  // widths: [3360,1200,1200,1200,1200,1200] sum=9360
  const aeW = scaleWidths([3360, 1200, 1200, 1200, 1200, 1200]);

  [...apoyosConEdad].sort((a,b) => sf(b.total) - sf(a.total)).forEach((a, ai) => {
    const r = a.rangos || {};
    // Encabezado del apoyo
    const headParaAp = new Paragraph({
      spacing: { before: 0, after: 30 },
      shading: { fill: C.azulMed, type: ShadingType.CLEAR },
      children: [
        new TextRun({ text: `  ${tcStr(a.apoyo)}`, bold: true, size: 18, color: C.blanco, font: 'Arial' }),
        new TextRun({ text: `  —  ${fmt(a.total)} apoyos  (${fmt(a.m)} mujeres / ${fmt(a.h)} hombres)`, size: 16, color: C.blanco, font: 'Arial' }),
      ],
    });
    const dataRowsAp = GRUPOS_A.map(([gL, keys], gi) => {
      let t=0,m=0,h=0;
      keys.forEach(k => { const g=r[k]||{m:0,h:0,total:0}; t+=sf(g.total); m+=sf(g.m); h+=sf(g.h); });
      if (t===0) return null;
      return { vals: [gL, fmt(t), pct(t,a.total), fmt(m), fmt(h), pct(m,t)], even: gi%2===0 };
    }).filter(Boolean);
    const innerTableAp = new Table({
      width: { size: PAGE_W, type: WidthType.DXA },
      columnWidths: aeW,
      rows: [
        hRow(['Grupo de edad','Total','% del total','Mujeres','Hombres','% Mujeres'], aeW, C.azulMed),
        ...dataRowsAp.map((dr, ri) =>
          ri === dataRowsAp.length - 1
            ? dRowLast(dr.vals, aeW, dr.even)
            : dRow(dr.vals, aeW, dr.even)
        ),
        totRow(['TOTAL', fmt(a.total), '100%', fmt(a.m), fmt(a.h), pct(a.m,a.total)], aeW),
      ],
    });
    // Tabla contenedora: evita división entre páginas
    children.push(new Table({
      width: { size: PAGE_W, type: WidthType.DXA },
      columnWidths: [PAGE_W],
      margins: { top: ai === 0 ? 0 : 200, bottom: 0, left: 0, right: 0 },
      rows: [new TableRow({
        cantSplit: true,
        children: [new TableCell({
          borders: brdNones,
          width: { size: PAGE_W, type: WidthType.DXA },
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          children: [headParaAp, innerTableAp],
        })],
      })],
    }));
    children.push(spacer(4));
  });
}


// ── SECCIÓN 6: CONCLUSIONES Y OBSERVACIONES ─────────────────────────────────

children.push(label('7. Conclusiones y Observaciones', { border: true, pageBreak: true }));
children.push(body(`Con base en los datos registrados al corte de ${MES.replace(/_/g,' ')} ${ANO}, se presentan las siguientes conclusiones para el municipio de ${nombre}:`));
children.push(spacer(4));

// ── 7.1 Cobertura y beneficiarios ────────────────────────────────────────────
children.push(label('7.1  Cobertura poblacional y beneficiarios', { bold: true, color: C.azulMed, size: 18, border: false }));
children.push(spacer(2));

const pob_num   = sf(mun.poblacion);
const cob_mun   = pob_num > 0 ? pct(total, pob_num) : null;
const ninos_c   = sf(rangos['0-5'])   + sf(rangos['6-11']);
const jovenes_c = sf(rangos['12-17']) + sf(rangos['18-29']);
const adultos_c = sf(rangos['30-49']) + sf(rangos['50-64']);
const mayores_c = sf(rangos['65+']);
const sndatos_c = sf(rangos['sin_datos']);

// Grupo dominante
const grupos = [
  { nombre: 'niños y niñas (0 a 11 años)',    val: ninos_c },
  { nombre: 'jóvenes (12 a 29 años)',          val: jovenes_c },
  { nombre: 'adultos (30 a 64 años)',           val: adultos_c },
  { nombre: 'adultos mayores (65 años o más)', val: mayores_c },
];
const grupoDom = grupos.reduce((a, b) => b.val > a.val ? b : a);

// Programa principal
const progPrincipal = [...progs_d].sort((a,b) => sf(b.total) - sf(a.total))[0];

const bullets61 = [];

if (cob_mun) {
  bullets61.push(`Se atendieron ${fmt(total)} beneficiarios únicos en el municipio, representando una cobertura del ${cob_mun} de la población municipal (${fmt(pob_num)} habitantes).`);
} else {
  bullets61.push(`Se atendieron ${fmt(total)} beneficiarios únicos en el municipio durante el período.`);
}

bullets61.push(`Del total de beneficiarios, ${fmt(m_tot)} son mujeres (${pct(m_tot,total)}) y ${fmt(h_tot)} son hombres (${pct(h_tot,total)})${sn_tot > 0 ? `. ${fmt(sn_tot)} registros no cuentan con dato de sexo asignado y requieren seguimiento para su correcta clasificación` : ''}.`);

bullets61.push(`Por rango de edad, el municipio presenta: ${fmt(ninos_c)} niños y niñas (0 a 11 años), ${fmt(jovenes_c)} jóvenes (12 a 29 años), ${fmt(adultos_c)} adultos (30 a 64 años) y ${fmt(mayores_c)} personas mayores (65 años o más). El segmento con mayor volumen de atención es el de ${grupoDom.nombre} con ${fmt(grupoDom.val)} beneficiarios (${pct(grupoDom.val, total)}).`);

if (progPrincipal) {
  bullets61.push(`El programa con mayor número de beneficiarios en el municipio es ${tcStr(progPrincipal.nombre)} (${progPrincipal.institucion}), con ${fmt(progPrincipal.total)} beneficiarios registrados (${pct(progPrincipal.total, total)} del total municipal).`);
}

bullets61.push(`Se registra atención a través de ${fmt(n_inst)} ${n_inst!==1?'instituciones':'institución'} y ${fmt(n_prog)} programa${n_prog!==1?'s':''} activos en el municipio durante el período.`);

bullets61.forEach(b => {
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

const no_loc     = total - tot_localizables;
const loc_pct    = pct(tot_localizables, total);
const no_loc_pct = pct(no_loc, total);
const loc_m_n    = sf(mun.loc_m);
const loc_h_n    = sf(mun.loc_h);

const bullets62 = [];

if (tot_localizables > 0) {
  bullets62.push(`Se identificaron ${fmt(tot_localizables)} beneficiarios localizables (${loc_pct} del total municipal), con datos de contacto, domicilio y ubicación completos y verificables.`);
  bullets62.push(`${fmt(no_loc)} beneficiarios (${no_loc_pct}) no cuentan con información de localización completa, lo que representa una oportunidad de mejora en la calidad del padrón municipal.`);
  bullets62.push(`De los beneficiarios localizables, ${fmt(loc_m_n)} son mujeres (${pct(loc_m_n, tot_localizables)}) y ${fmt(loc_h_n)} son hombres (${pct(loc_h_n, tot_localizables)}), consistente con la distribución de género del municipio.`);
} else {
  bullets62.push(`No se cuenta con datos de localización registrados para los beneficiarios de este municipio en el período actual.`);
  bullets62.push(`Se recomienda capturar la información de contacto y domicilio de los beneficiarios para habilitar el seguimiento de apoyos entregados.`);
}

bullets62.forEach(b => {
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

const apoyosPorVol = [...desglose_mun_f].sort((a,b) => sf(b.total) - sf(a.total));
const apoyoTop     = apoyosPorVol[0];
const apoyoTop2    = apoyosPorVol[1];
const n_tipos_c    = new Set(desglose_mun_f.map(a => a.apoyo)).size;

const bullets63 = [];

bullets63.push(`Se entregaron ${fmt(tot_apoyos_calc)} apoyos en el municipio durante el período, distribuidos en ${n_tipos_c} tipo${n_tipos_c!==1?'s':''} de apoyo registrados.`);

if (apoyoTop) {
  const apoyoTopTxt = `${tcStr(apoyoTop.apoyo)} con ${fmt(apoyoTop.total)} apoyos (${pct(apoyoTop.total, tot_apoyos_calc)} del total municipal)`;
  bullets63.push(`El tipo de apoyo con mayor volumen de entregas es: ${apoyoTopTxt}.`);
}

if (apoyoTop2) {
  bullets63.push(`El segundo apoyo más entregado es ${tcStr(apoyoTop2.apoyo)}, con ${fmt(apoyoTop2.total)} entregas (${pct(apoyoTop2.total, tot_apoyos_calc)}).`);
}

const ratio = total > 0 ? (sf(tot_apoyos_calc) / total).toFixed(1) : '0';
bullets63.push(`La relación de apoyos por beneficiario único en el municipio es de ${ratio} apoyos por persona, lo que ${parseFloat(ratio) >= 1.5 ? 'indica que varios beneficiarios reciben más de un tipo de apoyo' : 'indica una distribución mayormente de un apoyo por beneficiario'}.`);

bullets63.forEach(b => {
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
if (gasto_mun_est > 0) {
  children.push(label('7.4  Gasto estimado municipal', { bold: true, color: C.azulMed, size: 18, border: false }));
  children.push(spacer(2));
  const gastoXBenef = gasto_mun_est / total;
  const bullets64 = [
    `El gasto estimado para el municipio de ${nombre} asciende a $${Math.round(gasto_mun_est).toLocaleString('es-MX')} MXN, calculado con base en ${progs_con_gasto} programa${progs_con_gasto!==1?'s':''} con datos de gasto registrados.`,
    `El gasto estimado por beneficiario único en el municipio es de $${Math.round(gastoXBenef).toLocaleString('es-MX')} MXN.`,
    `Este estimado representa una aproximación con base en la información presupuestal disponible. Se recomienda completar el registro de gasto en todos los programas para obtener un análisis más preciso.`,
  ];
  bullets64.forEach(b => {
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
const _obsNumM = (gasto_mun_est && gasto_mun_est > 0) ? '7.5' : '7.4';
children.push(label(`${_obsNumM}  Observaciones y recomendaciones`, { bold: true, color: C.azulMed, size: 18, border: false }));
children.push(spacer(2));

const bullets65 = [];

bullets65.push(`El padrón de beneficiarios de ${nombre} refleja una cobertura activa a través de ${fmt(n_inst)} ${n_inst!==1?'instituciones':'institución'} y ${fmt(n_prog)} programa${n_prog!==1?'s':''} durante el período de reporte.`);

if (sn_tot > 0) {
  bullets65.push(`Se identifican ${fmt(sn_tot)} registros sin dato de sexo (${pct(sn_tot,total)}). Se recomienda implementar un proceso de depuración y actualización de estos registros para mejorar la calidad del padrón municipal.`);
}

if (no_loc > 0 && tot_localizables > 0) {
  const brechaLoc = no_loc / total;
  if (brechaLoc > 0.3) {
    bullets65.push(`La brecha de localización es significativa: ${no_loc_pct} de los beneficiarios no cuenta con datos de contacto completos. Se recomienda priorizar la actualización de información de localización en este municipio.`);
  } else {
    bullets65.push(`El municipio presenta una tasa de localización de ${loc_pct}, lo que refleja una buena calidad de datos de contacto en el padrón.`);
  }
}

bullets65.push(`Se recomienda mantener la actualización periódica del padrón municipal para garantizar la correcta clasificación de beneficiarios, la entrega oportuna de apoyos y el monitoreo del desempeño institucional en los siguientes períodos de reporte.`);

bullets65.forEach(b => {
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

// ── NOTAS FINALES ────────────────────────────────────────────────────────────
children.push(new Paragraph({
  border: { top: brd(C.grisM, 4) },
  spacing: { before: 200, after: 40 },
  children: [new TextRun({ text: `Documento generado el ${fecha_str}. Fuente: Padrón de beneficiarios — SDHyBC, Gobierno del Estado de Chihuahua.`, size: 15, color: C.gris, font: 'Arial', italics: true })],
}));

// ── Ensamblar documento ───────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 18 } } },
  },
  sections: [{
    properties: {
      page: {
        size:   { width: 12240, height: 15840 },
        margin: { top: 900, right: 800, bottom: 800, left: 800 },
      },
    },
    headers: { default: makeHeader(nombre) },
    footers: { default: makeFooter() },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT_PATH, buf);
  const kb = (buf.length / 1024).toFixed(0);
  console.log(`OK:${OUT_PATH}:${kb}`);
}).catch(e => { console.error('ERR:' + e.message); process.exit(1); });
