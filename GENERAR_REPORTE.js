#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   GENERADOR DE REPORTE — CHIHUAHUA                         ║
 * ║   Secretaría de Desarrollo Humano y Bien Común             ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const readline  = require('readline');
const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const CLR = {
  reset:'\x1b[0m', bold:'\x1b[1m', cyan:'\x1b[36m',
  green:'\x1b[32m', yellow:'\x1b[33m', red:'\x1b[31m',
  blue:'\x1b[34m',  gray:'\x1b[90m',
};
const c    = (color, text) => CLR[color] + text + CLR.reset;
const ok   = text => console.log(c('green',  '  \u2713 ') + text);
const info = text => console.log(c('cyan',   '  \u2192 ') + text);
const warn = text => console.log(c('yellow', '  \u26a0 ') + text);
const err  = text => console.log(c('red',    '  \u2717 ') + text);

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const TRIMESTRES = ['1er_Trimestre','2do_Trimestre','3er_Trimestre','4to_Trimestre_Cierre'];
const TRIMESTRES_LABEL = [
  '1er Trimestre  (Enero - Marzo)',
  '2do Trimestre  (Abril - Junio)',
  '3er Trimestre  (Julio - Septiembre)',
  '4to Trimestre - Cierre  (Octubre - Diciembre)',
];
const DIR = __dirname;

// ── Modo automático --web ─────────────────────────────────────────────────────
const AUTO_WEB = process.argv.includes('--web');
// Destino fijo para el modo automático
const WEB_DIR  = DIR;  // archivos del dashboard en la raiz

// ─── EJECUTAR PYTHON — stdin aislado para no romper readline ─────────────────
function pyRun(args) {
  // spawnSync con stdin:'ignore' — Python no toca stdin del proceso padre
  const r = spawnSync('python3', args, {
    stdio: ['ignore', 'inherit', 'inherit'],
    cwd: DIR,
  });
  return r.status === 0;
}

function pyCapture(args) {
  const r = spawnSync('python3', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: DIR,
  });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  return r.stdout.toString();
}

// ─── DEPENDENCIAS ─────────────────────────────────────────────────────────────
function verificarDependencias() {
  console.log(c('gray', '\n  Verificando dependencias...\n'));
  let flag = true;
  try { execSync('python3 --version', { stdio:'pipe' }); ok('Python 3 encontrado.'); }
  catch { err('Python no encontrado. Descargalo en python.org'); flag = false; }
  ['openpyxl','matplotlib'].forEach(mod => {
    try { execSync(`python3 -c "import ${mod}"`, { stdio:'pipe' }); ok(`${mod} encontrado.`); }
    catch { err(`${mod} no instalado. Ejecuta: pip install ${mod}`); flag = false; }
  });
  // Archivos del dashboard (estructura separada)
  const dashFiles = [
    'index.html',
    'css_base.css','css_layout.css','css_charts.css',
    'css_tables.css','css_catalog.css','css_modals.css',
    'js_init.js','js_utils.js',
    'js_render_general.js','js_render_inst.js','js_render_muns.js','js_render_apoyos.js',
    'js_catalogo_modal.js','js_inst_modal.js','js_filters_tabs.js',
    'js_map2.js',
    'js_render_nutri.js',
  ];
  const req = ['motor_reporte_padron.py','read_excel_padron.py','generar_municipios.py',
               'generar_instituciones.py','build_municipio.js','build_institucion.js',
               'generar_dashboard_data.py', ...dashFiles];
  // Los archivos del dashboard viven en la raiz junto con el pipeline
  const falt = req.filter(f => {
    if (dashFiles.includes(f)) return !fs.existsSync(path.join(DIR, f));
    return !fs.existsSync(path.join(DIR, f));
  });
  if (!falt.length) ok('Scripts de generacion encontrados.');
  else { err(`Archivos faltantes: ${falt.join(', ')}`); flag = false; }
  return flag;
}

// ─── EXCEL ────────────────────────────────────────────────────────────────────
function buscarExcel() {
  const arch = fs.readdirSync(DIR).filter(f =>
    f.toLowerCase().endsWith('.xlsx') && !f.startsWith('~$'));
  if (!arch.length) return null;
  if (arch.length === 1) return path.join(DIR, arch[0]);
  const inf = arch.find(f => /informe/i.test(f)); if (inf) return path.join(DIR, inf);
  const rep = arch.find(f => /reporte/i.test(f)); if (rep) return path.join(DIR, rep);
  return path.join(DIR, arch[0]);
}

function periodoActual() {
  const hoy = new Date();
  return { mes: MESES[hoy.getMonth()], año: String(hoy.getFullYear()) };
}

// ─── CACHÉ DEL JSON DEL EXCEL (evita triple lectura) ─────────────────────────
let _cachedExcelData     = null;  // datos completos (lento, solo cuando se genera)
let _cachedListaData     = null;  // datos de lista (rápido, para el menú)

function leerExcelData(excelPath) {
  if (_cachedExcelData) return _cachedExcelData;
  const out = pyCapture([path.join(DIR,'read_excel_padron.py'), excelPath]);
  _cachedExcelData = JSON.parse(out);
  return _cachedExcelData;
}

function leerExcelLista(excelPath) {
  // Modo rápido: solo instituciones y municipios, sin filtros cruzados
  if (_cachedListaData) return _cachedListaData;
  const out = pyCapture([path.join(DIR,'read_excel_padron.py'), excelPath, '--lista']);
  _cachedListaData = JSON.parse(out);
  return _cachedListaData;
}

// ─── MUNICIPIOS ───────────────────────────────────────────────────────────────
function leerMunicipios(excelPath) {
  try {
    const data = leerExcelLista(excelPath);
    return (data.municipios || []).map(m => m.municipio).sort();
  } catch (e) {
    warn('No se pudo leer municipios: ' + e.message);
    return [];
  }
}

// ─── LEER INSTITUCIONES DEL EXCEL ────────────────────────────────────────────
function leerInstituciones(excelPath) {
  try {
    const data = leerExcelLista(excelPath);
    const insts = data.instituciones || {};
    return Object.entries(insts)
      .sort((a,b) => parseFloat(b[1].total||0) - parseFloat(a[1].total||0))
      .map(([key]) => key);
  } catch (e) {
    warn('No se pudo leer instituciones: ' + e.message);
    return [];
  }
}
// Sin tildes para mostrar en consola Windows
function nd(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
}

function mostrarMunicipios(lista) {
  console.log('');
  console.log(c('cyan', '  Municipios (1-67):'));
  console.log('');
  const col = Math.ceil(lista.length / 2);
  for (let i = 0; i < col; i++) {
    const izq = `${String(i+1).padStart(2)}. ${nd(lista[i] || '')}`.padEnd(36);
    const der = lista[i+col] ? `${String(i+1+col).padStart(2)}. ${nd(lista[i+col])}` : '';
    console.log(c('gray', `    ${izq}  ${der}`));
  }
  console.log('');
}

// ─── READLINE (único, vive toda la sesión) ────────────────────────────────────
const RL  = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => RL.question(q, resolve));

// ─── RUN WEB AUTOMÁTICO — sin preguntas, destino fijo Reportes/2026/JP ─────────
async function runWeb(excelPath) {
  const dashScript = path.join(DIR, 'generar_dashboard_data.py');
  const htmlSrc    = path.join(DIR, 'index.html');

  if (!fs.existsSync(dashScript)) { err('generar_dashboard_data.py no encontrado.'); return; }
  if (!fs.existsSync(htmlSrc))    { err('index.html no encontrado en la raiz.'); return; }

  // Crear carpeta destino si no existe
  if (!fs.existsSync(WEB_DIR)) {
    fs.mkdirSync(WEB_DIR, { recursive: true });
    ok(`Carpeta creada: ${WEB_DIR}`);
  }

  // Regenerar data_dashboard.js
  info('Leyendo Excel y generando data_dashboard.js...');
  const ok1 = pyRun([dashScript, excelPath]);
  const dataPath = path.join(DIR, 'data_dashboard.js');

  if (!ok1 || !fs.existsSync(dataPath)) {
    err('Error al generar data_dashboard.js.'); return;
  }
  ok('data_dashboard.js actualizado.');

  // Copiar data_dashboard.js a destino (sobreescribir)
  const destData = path.join(WEB_DIR, 'data_dashboard.js');
  fs.copyFileSync(dataPath, destData);
  ok(`data_dashboard.js → ${destData}`);

  // Copiar index.html y todos los archivos del dashboard (CSS + JS separados)
  const DASH_FILES = [
    'index.html',
    'css_base.css','css_layout.css','css_charts.css',
    'css_tables.css','css_catalog.css','css_modals.css',
    'js_init.js','js_utils.js',
    'js_render_general.js','js_render_inst.js','js_render_muns.js','js_render_apoyos.js',
    'js_catalogo_modal.js','js_inst_modal.js','js_filters_tabs.js',
    'js_map2.js',
  ];
  let copiedFiles = 0;
  for (const fname of DASH_FILES) {
    const src  = path.join(DIR, fname);
    const dest = path.join(WEB_DIR, fname);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      copiedFiles++;
    } else {
      warn(`Archivo no encontrado, omitiendo: ${fname}`);
    }
  }
  ok(`${copiedFiles}/${DASH_FILES.length} archivos del dashboard copiados → ${WEB_DIR}`);

  // Resultado
  console.log('');
  console.log(c('green', c('bold',
    '  ╔═══════════════════════════════════════════╗\n' +
    '  ║   DASHBOARD ACTUALIZADO                   ║\n' +
    '  ╚═══════════════════════════════════════════╝'
  )));
  const kbIdx = fs.existsSync(path.join(WEB_DIR,'index.html'))
    ? (fs.statSync(path.join(WEB_DIR,'index.html')).size / 1024).toFixed(0) : '?';
  ok(`index.html  (${kbIdx} KB)`);
  ok(`Carpeta: ${WEB_DIR}`);

  // Abrir en el navegador
  try {
    const { exec } = require('child_process');
    if (process.platform === 'win32')      exec(`start "" "${destHtml}"`);
    else if (process.platform === 'darwin') exec(`open "${destHtml}"`);
    else                                    exec(`xdg-open "${destHtml}"`);
  } catch {}
}

// ─── RUN (se llama en loop para cada reporte) ─────────────────────────────────
async function run(excelPath) {

  // Período
  console.log('');
  const sug = periodoActual();
  info(`Periodo sugerido: ${c('bold', `${sug.mes} ${sug.año}`)}`);
  console.log('');
  console.log(c('gray', '    1. Mensual    2. Trimestral'));
  console.log('');
  const tipoPer = (await ask(c('cyan', '  Tipo (1/2, Enter=mensual): '))).trim();

  let mes, año;
  if (tipoPer === '2') {
    console.log('');
    TRIMESTRES_LABEL.forEach((t,i) => console.log(c('gray', `    ${i+1}. ${t}`)));
    console.log('');
    const tNum = (await ask(c('cyan', '  Trimestre (1-4): '))).trim();
    mes = TRIMESTRES[Math.max(0,Math.min(3,parseInt(tNum)-1))||0];
    año = (await ask(c('cyan', `  Año (Enter=${sug.año}): `))).trim() || sug.año;
  } else {
    const usar = (await ask(c('cyan', '  Usar periodo sugerido? (Enter=si / n=cambiar): '))).trim();
    if (usar.toLowerCase() === 'n') {
      console.log('');
      MESES.forEach((m,i) => console.log(c('gray', `    ${String(i+1).padStart(2)}. ${m}`)));
      console.log('');
      const mNum = (await ask(c('cyan', '  Numero de mes (1-12): '))).trim();
      mes = MESES[parseInt(mNum)-1] || sug.mes;
      año = (await ask(c('cyan', `  Año (Enter=${sug.año}): `))).trim() || sug.año;
    } else { mes = sug.mes; año = sug.año; }
  }

  // Rutas
  const nombreArchivo = `Reporte_Programas_Sociales_${mes}_${año}.docx`;
  const reportesDir   = path.join(DIR, 'Reportes');
  const subDir        = path.join(reportesDir, `${mes}_${año}`);
  if (!fs.existsSync(reportesDir)) fs.mkdirSync(reportesDir);
  if (!fs.existsSync(subDir))      fs.mkdirSync(subDir);
  const outputPath = path.join(subDir, nombreArchivo);

  console.log('');
  console.log(c('blue', '  ─────────────────────────────────────────────'));
  info(`Periodo : ${c('bold', `${mes} ${año}`)}`);
  info(`Excel   : ${c('bold', path.basename(excelPath))}`);
  console.log(c('blue', '  ─────────────────────────────────────────────'));

  // Menu
  console.log('');
  console.log(c('cyan', c('bold', '  Que deseas generar?')));
  console.log('');
  console.log(c('gray', '    1. Todo  (reporte general + municipios + instituciones + informe web)'));
  console.log(c('gray', '    2. Solo el reporte general'));
  console.log(c('gray', '    3. Solo documentos municipales  (todos los 67)'));
  console.log(c('gray', '    4. Municipio(s) especifico(s)'));
  console.log(c('gray', '    5. Solo documentos institucionales  (todas las instituciones)'));
  console.log(c('gray', '    6. Institucion(es) especifica(s)'));
  console.log(c('gray', '    7. Solo informe web  (dashboard HTML)'));
  console.log(c('gray', '    8. ' + c('yellow', 'Reporte NutriChihuahua  (Word + actualiza dashboard)')));
  console.log(c('gray', '    9. ' + c('gray',   'Describir en texto libre')));
  console.log('');
  const opcion = (await ask(c('cyan', '  Opcion (1-9): '))).trim();

  // Opción 4: selección por número
  let municipiosFiltro  = [];
  let municipiosIndices = [];
  if (opcion === '4') {
    info('Leyendo lista de municipios...');
    const lista = leerMunicipios(excelPath);
    if (!lista.length) { err('No se pudo obtener la lista.'); return; }

    mostrarMunicipios(lista);

    console.log(c('cyan',  '  Escribe los numeros separados por coma.'));
    console.log(c('gray',  '  Ejemplo: 14,37,20   Rango: 1-10'));
    console.log('');
    const input = (await ask(c('cyan', '  Numero(s): '))).trim();

    const nums = new Set();
    input.split(',').forEach(p => {
      p = p.trim();
      if (p.includes('-')) {
        const [a,b] = p.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(a) && !isNaN(b)) for (let i=a; i<=b; i++) nums.add(i);
      } else {
        const n = parseInt(p);
        if (!isNaN(n)) nums.add(n);
      }
    });

    [...nums].sort((a,b)=>a-b).forEach(n => {
      if (n >= 1 && n <= lista.length) {
        municipiosFiltro.push(lista[n-1]);
        municipiosIndices.push(n);
      } else warn(`Numero ${n} fuera de rango (1-${lista.length})`);
    });

    if (!municipiosFiltro.length) { err('Sin municipios validos.'); return; }
    console.log('');
    ok(`Seleccionados: ${municipiosFiltro.map(nd).join(', ')}`);
  }


  // Opción 6: selección de institución(es) por número
  let institucionesFiltro  = [];
  let institucionesIndices = [];
  if (opcion === '6') {
    info('Leyendo lista de instituciones...');
    const listaInst = leerInstituciones(excelPath);
    if (!listaInst.length) { err('No se pudo obtener la lista de instituciones.'); return; }

    console.log('');
    console.log(c('cyan', '  Instituciones disponibles:'));
    console.log('');
    listaInst.forEach((inst, i) => {
      console.log(c('gray', `    ${String(i+1).padStart(2)}. ${inst}`));
    });
    console.log('');
    console.log(c('cyan',  '  Escribe los numeros separados por coma.'));
    console.log('');
    const inputInst = (await ask(c('cyan', '  Numero(s): '))).trim();

    const numsInst = new Set();
    inputInst.split(',').forEach(p => {
      p = p.trim();
      if (p.includes('-')) {
        const [a,b] = p.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(a) && !isNaN(b)) for (let i=a; i<=b; i++) numsInst.add(i);
      } else {
        const n = parseInt(p);
        if (!isNaN(n)) numsInst.add(n);
      }
    });

    [...numsInst].sort((a,b)=>a-b).forEach(n => {
      if (n >= 1 && n <= listaInst.length) {
        institucionesFiltro.push(listaInst[n-1]);
        institucionesIndices.push(n);
      } else warn(`Numero ${n} fuera de rango (1-${listaInst.length})`);
    });

    if (!institucionesFiltro.length) { err('Sin instituciones validas.'); return; }
    console.log('');
    ok(`Seleccionadas: ${institucionesFiltro.join(', ')}`);
  }

  // ── FILTROS DE CONTENIDO (sexo y grupo de edad) ────────────────────────────
  // Se preguntan para opciones que generan reportes municipales o institucionales.
  // El filtro enriquece las secciones de desglose pero no altera los totales globales.
  const pideFiltros = ['1','3','4','5','6','46'].includes(opcion);
  let filtroSexo      = null;   // null = todos | 'm' | 'h'
  let filtroRangos    = null;   // null = todos | array de claves

  const RANGOS_DISP = [
    { key: '0-5',       label: '0 - 5 años'       },
    { key: '6-11',      label: '6 - 11 años'      },
    { key: '12-17',     label: '12 - 17 años'     },
    { key: '18-29',     label: '18 - 29 años'     },
    { key: '30-49',     label: '30 - 49 años'     },
    { key: '50-64',     label: '50 - 64 años'     },
    { key: '65+',       label: '65 años o mas'    },
  ];

  if (pideFiltros) {
    console.log('');
    console.log(c('blue', '  ─────────────────────────────────────────────'));
    console.log(c('cyan', c('bold', '  Filtros de contenido (opcional)')));
    console.log(c('gray', '  Agregan secciones de desglose detallado al reporte.'));
    console.log(c('gray', '  Presiona Enter para incluir todos los datos sin filtro.'));
    console.log(c('blue', '  ─────────────────────────────────────────────'));

    // Filtro de sexo
    console.log('');
    console.log(c('gray', '    1. Todos (mujeres + hombres + sin dato)'));
    console.log(c('gray', '    2. Solo Mujeres'));
    console.log(c('gray', '    3. Solo Hombres'));
    console.log('');
    const rSexo = (await ask(c('cyan', '  Sexo a reportar (1/2/3, Enter=todos): '))).trim();
    if (rSexo === '2') { filtroSexo = 'm'; ok('Filtro de sexo: Mujeres'); }
    else if (rSexo === '3') { filtroSexo = 'h'; ok('Filtro de sexo: Hombres'); }
    else ok('Filtro de sexo: Todos');

    // Filtro de rango de edad — los 7 rangos exactos del Excel
    console.log('');
    console.log(c('gray', '    0. Todos los rangos de edad  (Enter)'));
    RANGOS_DISP.forEach((r, i) => console.log(c('gray', `    ${i+1}. ${r.label}`)));
    console.log('');
    console.log(c('cyan',  '  Puedes elegir uno o varios separados por coma.'));
    console.log(c('gray',  '  Ejemplo: 1,2,3,4  incluye de 0 a 29 anos.'));
    console.log('');
    const rEdad = (await ask(c('cyan', `  Rangos de edad (0-${RANGOS_DISP.length} o varios, Enter=todos): `))).trim();

    if (!rEdad || rEdad === '0') {
      filtroRangos = null;
      ok('Filtro de edad: Todos los rangos');
    } else {
      filtroRangos = rEdad.split(',')
        .map(x => parseInt(x.trim()))
        .filter(n => n >= 1 && n <= RANGOS_DISP.length)
        .map(n => RANGOS_DISP[n-1].key);
      if (filtroRangos.length) {
        const labels = filtroRangos.map(k => RANGOS_DISP.find(r => r.key === k).label);
        ok('Filtro de edad: ' + labels.join(', '));
      } else {
        filtroRangos = null;
        ok('Sin filtro de edad');
      }
    }
  }

  // ── Opción 8: Reporte NutriChihuahua ─────────────────────────────────────
  if (opcion === '8') {
    // Paso 1: actualizar js_render_nutri.js (datos del dashboard web)
    info('Generando datos NutriChihuahua para el dashboard...');
    const okNutri = pyRun([
      path.join(DIR, 'generar_dashboard_data.py'),
      excelPath, '--nutrichihuahua-only'
    ]);
    if (okNutri) {
      ok('NutriChihuahua procesado correctamente.');
    } else {
      warn('generar_dashboard_data.py no soporta --nutrichihuahua-only. Ejecutando pipeline completo web...');
      pyRun([path.join(DIR, 'generar_dashboard_data.py'), excelPath]);
    }

    // Paso 2: generar el reporte Word de NutriChihuahua (editable, exportable a PDF)
    console.log('');
    info('Generando reporte Word de NutriChihuahua...');
    const nombreNutri  = `NutriChihuahua_${mes}_${año}.docx`;
    const outputNutri  = path.join(subDir, nombreNutri);
    const okNutriDocx  = pyRun([
      path.join(DIR, 'generar_nutrichihuahua.py'),
      excelPath, mes, año, outputNutri
    ]);
    if (okNutriDocx && fs.existsSync(outputNutri)) {
      ok(`Reporte Word generado: ${c('bold', outputNutri)}`);
    } else {
      err('Error al generar el reporte Word de NutriChihuahua.');
    }

    ok('Listo. Actualiza el dashboard para ver los cambios.');
    RL.close();
    return;
  }

  let opcionFinal = opcion;
  if (opcion === '9') {
    console.log('');
    console.log(c('cyan', '  Describe lo que necesitas. Ejemplos:'));
    console.log(c('gray', '    "reporte del municipio de Ahumada"'));
    console.log(c('gray', '    "mujeres atendidas en Allende con apoyo de SDHyBC"'));
    console.log('');
    const descripcion = (await ask(c('cyan', '  Describe tu reporte: '))).trim();
    if (!descripcion) { err('No escribiste nada.'); return; }
    info('Interpretando...');
    const listaMuns8  = leerMunicipios(excelPath);
    const listaInsts8 = leerInstituciones(excelPath);

    function detectarPorTexto8(txt) {
      const t = txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const muns  = listaMuns8.filter(m => t.includes(m.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
      const insts = listaInsts8.filter(i => t.includes(i.toLowerCase()));
      let op;
      if (/dashboard|web|html/.test(t))                                op = '7';
      else if (/todo|completo/.test(t) && !muns.length && !insts.length) op = '1';
      else if (/todos.*municipios/.test(t) && !muns.length)           op = '3';
      else if (/todas.*instituciones/.test(t) && !insts.length)       op = '5';
      else if (muns.length && insts.length)                           op = '46';
      else if (muns.length)                                           op = '4';
      else if (insts.length)                                          op = '6';
      else                                                            op = '2';
      return { muns, insts, op };
    }

    const envPath8 = path.join(DIR, '.env');
    let apiKey8 = process.env.ANTHROPIC_API_KEY || '';
    if (!apiKey8 && fs.existsSync(envPath8)) {
      const envContent8 = fs.readFileSync(envPath8, 'utf8');
      const m8 = envContent8.split('\n').find(l => l.startsWith('ANTHROPIC_API_KEY'));
      if (m8) apiKey8 = m8.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
    }

    if (!apiKey8) {
      warn('Sin API key — usando deteccion por texto.');
      const det = detectarPorTexto8(descripcion);
      municipiosFiltro    = det.muns;
      municipiosIndices   = det.muns.map(m => listaMuns8.indexOf(m) + 1);
      institucionesFiltro = det.insts;
      institucionesIndices = det.insts.map(i => listaInsts8.indexOf(i) + 1);
      opcionFinal         = det.op;
      if (municipiosFiltro.length)    ok('Municipios: ' + municipiosFiltro.join(', '));
      if (institucionesFiltro.length) ok('Instituciones: ' + institucionesFiltro.join(', '));
      if (opcionFinal === '2') warn('Sin coincidencias — reporte general.');
    } else {
      const promptLines = [
        'Interpreta esta solicitud de reporte del padron de beneficiarios de Chihuahua.',
        'Solicitud: "' + descripcion + '"',
        'Municipios: ' + JSON.stringify(listaMuns8),
        'Instituciones: ' + JSON.stringify(listaInsts8),
        'Devuelve SOLO JSON: {"opcion":"1|2|3|4|5|6|7|4+6","municipios":[],"instituciones":[],"desc":"resumen"}'
      ];
      const promptStr = promptLines.join('\n');
      const pyLines = [
        'import urllib.request, json',
        'body = json.dumps({"model":"claude-sonnet-4-20250514","max_tokens":300,"messages":[{"role":"user","content":' + JSON.stringify(promptStr) + '}]}).encode()',
        'req = urllib.request.Request("https://api.anthropic.com/v1/messages",data=body,headers={"Content-Type":"application/json","x-api-key":' + JSON.stringify(apiKey8) + ',"anthropic-version":"2023-06-01"})',
        'print(urllib.request.urlopen(req).read().decode())'
      ];
      const tmpPy = path.join(DIR, '_tcq.py');
      try {
        fs.writeFileSync(tmpPy, pyLines.join('\n'), 'utf8');
        const raw    = pyCapture([tmpPy]);
        const parsed = JSON.parse(raw);
        const txt    = parsed.content?.[0]?.text || '';
        const jm     = txt.match(/\{[\s\S]*\}/);
        if (!jm) throw new Error('Sin JSON en respuesta');
        const interp = JSON.parse(jm[0]);
        ok('Interpretado: ' + c('bold', interp.desc || interp.descripcion_interpretada || ''));
        opcionFinal         = interp.opcion === '4+6' ? '46' : (interp.opcion || '2');
        municipiosFiltro    = (interp.municipios || []).filter(m => listaMuns8.includes(m));
        municipiosIndices   = municipiosFiltro.map(m => listaMuns8.indexOf(m) + 1);
        institucionesFiltro = (interp.instituciones || []).filter(i => listaInsts8.includes(i));
        institucionesIndices = institucionesFiltro.map(i => listaInsts8.indexOf(i) + 1);
        if (municipiosFiltro.length)    ok('Municipios: ' + municipiosFiltro.join(', '));
        if (institucionesFiltro.length) ok('Instituciones: ' + institucionesFiltro.join(', '));
      } catch(e8) {
        err('Error API: ' + e8.message + ' — usando deteccion por texto.');
        const det2 = detectarPorTexto8(descripcion);
        municipiosFiltro    = det2.muns;
        municipiosIndices   = det2.muns.map(m => listaMuns8.indexOf(m) + 1);
        institucionesFiltro = det2.insts;
        institucionesIndices = det2.insts.map(i => listaInsts8.indexOf(i) + 1);
        opcionFinal         = det2.op;
        if (municipiosFiltro.length)    ok('Municipios: ' + municipiosFiltro.join(', '));
        if (institucionesFiltro.length) ok('Instituciones: ' + institucionesFiltro.join(', '));
      } finally {
        try { fs.unlinkSync(tmpPy); } catch {}
      }
    }
  }

  const generarPrincipal      = ['1','2','46'].includes(opcionFinal);
  const generarMunicipios     = ['1','3','4','46'].includes(opcionFinal);
  const generarInstituciones  = ['1','5','6','46'].includes(opcionFinal);
  const generarWeb            = ['1','7'].includes(opcionFinal);
  console.log('');

  // Generar reporte general
  let reportePrincipalOk = false;
  if (generarPrincipal) {
    info('Generando reporte general...');
    const ok2 = pyRun([
      path.join(DIR,'motor_reporte_padron.py'),
      excelPath, mes, '1', año, outputPath
    ]);
    reportePrincipalOk = ok2 && fs.existsSync(outputPath);
    if (!reportePrincipalOk) err('Error al generar el reporte general.');
  }

  // Generar municipios
  let municipiosGenerados = 0;
  if (generarMunicipios) {
    const munScript = path.join(DIR, 'generar_municipios.py');
    const filtrosArgs = [];
    if (filtroSexo)   filtrosArgs.push('--sexo',   filtroSexo);
    if (filtroRangos) filtrosArgs.push('--rangos',  filtroRangos.join(','));

    if (['4','46'].includes(opcionFinal)) {
      info(`Generando ${municipiosIndices.length} municipio(s)...`);
      const ok3 = pyRun([munScript, excelPath, mes, año, reportesDir,
                         '--indices', municipiosIndices.join(','), ...filtrosArgs]);
      if (ok3) municipiosGenerados = municipiosIndices.length;
      else warn('Error generando documentos municipales.');
    } else {
      info('Generando 67 documentos municipales...');
      const ok4 = pyRun([munScript, excelPath, mes, año, reportesDir, ...filtrosArgs]);
      if (ok4) municipiosGenerados = 67;
      else warn('Error generando documentos municipales.');
    }
  }

  // Generar instituciones
  let institucionesGeneradas = 0;
  if (generarInstituciones) {
    const instScript = path.join(DIR, 'generar_instituciones.py');
    const filtrosArgs = [];
    if (filtroSexo)   filtrosArgs.push('--sexo',   filtroSexo);
    if (filtroRangos) filtrosArgs.push('--rangos',  filtroRangos.join(','));

    if (['6','46'].includes(opcionFinal)) {
      info(`Generando ${institucionesIndices.length} institucion(es)...`);
      const okI = pyRun([instScript, excelPath, mes, año, reportesDir,
                         '--indices', institucionesIndices.join(','), ...filtrosArgs]);
      if (okI) institucionesGeneradas = institucionesIndices.length;
      else warn('Error generando documentos institucionales.');
    } else {
      info('Generando documentos por institucion...');
      const okI = pyRun([instScript, excelPath, mes, año, reportesDir, ...filtrosArgs]);
      if (okI) institucionesGeneradas = leerInstituciones(excelPath).length;
      else warn('Error generando documentos institucionales.');
    }
  }

  // Generar informe web — SOLO actualiza data_dashboard.js
  // dashboard.html es archivo curado manualmente: NUNCA se regenera ni sobreescribe.
  let webGeneradoOk = false;
  let webDataPath   = '';
  let webHtmlPath   = '';
  if (generarWeb) {
    info('Actualizando datos del informe web (data_dashboard.js)...');
    const dashScript = path.join(DIR, 'generar_dashboard_data.py');
    const htmlSrc    = path.join(DIR, 'index.html');
    if (!fs.existsSync(dashScript)) {
      warn('generar_dashboard_data.py no encontrado — omitiendo dashboard.');
    } else if (!fs.existsSync(htmlSrc)) {
      warn('index.html no encontrado en la raiz.');
    } else {
      // Solo regenera el archivo de datos — nunca toca los archivos del dashboard
      const ok5 = pyRun([dashScript, excelPath]);
      webDataPath = path.join(DIR, 'data_dashboard.js');
      if (ok5 && fs.existsSync(webDataPath)) {
        webGeneradoOk = true;
        webHtmlPath   = htmlSrc;
        // Guardar copia del data en historial del periodo
        try { fs.copyFileSync(webDataPath, path.join(subDir, 'data_dashboard.js')); } catch {}
        ok('data_dashboard.js actualizado con los datos del Excel.');
        ok('Archivos del dashboard sin cambios — usa siempre los archivos curados de la raiz.');
      } else {
        warn('Error al generar data_dashboard.js. Verifica generar_dashboard_data.py.');
      }
    }
  }

  // Resultado
  console.log('');
  console.log(c('green', c('bold',
    '  ╔═══════════════════════════════════════════╗\n' +
    '  ║   OK GENERACION COMPLETADA               ║\n' +
    '  ╚═══════════════════════════════════════════╝'
  )));
  if (generarPrincipal) {
    if (reportePrincipalOk) {
      const kb = (fs.statSync(outputPath).size/1024).toFixed(0);
      ok(`Reporte general: ${nombreArchivo}  (${kb} KB)`);
    } else warn('El reporte general no se pudo generar.');
  }
  if (generarMunicipios) {
    if (['4','46'].includes(opcionFinal)) ok(`Municipios: ${municipiosFiltro.map(nd).join(', ')}`);
    else ok(`${municipiosGenerados} documentos municipales generados`);
    ok(`Carpeta: ${subDir}`);
  }
  if (generarInstituciones) {
    if (['6','46'].includes(opcionFinal)) ok(`Instituciones: ${institucionesFiltro.join(', ')}`);
    else ok(`${institucionesGeneradas} documentos institucionales generados`);
    ok(`Carpeta: ${subDir}`);
  }
  if (generarWeb) {
    if (webGeneradoOk) {
      const kb = (fs.statSync(webHtmlPath).size / 1024).toFixed(0);
      ok(`Informe web: ${path.basename(webHtmlPath)}  (${kb} KB)`);
      ok(`Carpeta: ${path.dirname(webHtmlPath)}`);
    } else {
      warn('El informe web no se pudo generar.');
    }
  }

  // Abrir archivo(s)
  if (reportePrincipalOk || webGeneradoOk) {
    try {
      const { exec } = require('child_process');
      if (reportePrincipalOk) {
        if (process.platform === 'win32') exec(`start "" "${outputPath}"`);
        else if (process.platform === 'darwin') exec(`open "${outputPath}"`);
        else exec(`xdg-open "${outputPath}"`);
      }
      if (webGeneradoOk) {
        // Pequeña pausa para que no se abran al mismo tiempo
        setTimeout(() => {
          if (process.platform === 'win32') exec(`start "" "${webHtmlPath}"`);
          else if (process.platform === 'darwin') exec(`open "${webHtmlPath}"`);
          else exec(`xdg-open "${webHtmlPath}"`);
        }, 800);
      }
    } catch {}
  }

  // Loop
  console.log('');
  const continuar = (await ask(c('cyan', '  Generar otro reporte? (Enter=si / n=salir): '))).trim();
  if (continuar.toLowerCase() !== 'n') {
    console.log('');
    await run(excelPath);
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n' + c('blue', c('bold',
    '╔══════════════════════════════════════════════════════════════╗\n' +
    '║   GENERADOR DE REPORTE - CHIHUAHUA                         ║\n' +
    '║   Secretaria de Desarrollo Humano y Bien Comun             ║\n' +
    '╚══════════════════════════════════════════════════════════════╝'
  )));

  if (!verificarDependencias()) {
    console.log(c('red', '\n  Corrige los errores anteriores y vuelve a intentarlo.\n'));
    RL.close(); process.exit(1);
  }

  // Modo automático: --web genera dashboard directo sin preguntas
  if (AUTO_WEB) {
    console.log('');
    info(c('bold', 'Modo automatico --web: generando dashboard directamente.'));
    let excelPath = buscarExcel();
    if (!excelPath) { err('No se encontro ningun .xlsx en esta carpeta.'); RL.close(); process.exit(1); }
    ok(`Excel: ${path.basename(excelPath)}`);
    await runWeb(excelPath);
    RL.close();
    return;
  }

  // Excel (una sola vez)
  console.log('');
  let excelPath = buscarExcel();
  if (excelPath) {
    info(`Excel detectado: ${c('bold', path.basename(excelPath))}`);
    const resp = (await ask(c('cyan', '  Usar este archivo? (Enter=si / escribe otra ruta): '))).trim();
    if (resp) excelPath = resp.replace(/^["']|["']$/g,'');
  } else {
    warn('No se encontro ningun .xlsx en esta carpeta.');
    excelPath = (await ask(c('cyan', '  Ruta del archivo Excel: '))).trim().replace(/^["']|["']$/g,'');
  }
  if (!fs.existsSync(excelPath)) { err(`No se encontro: ${excelPath}`); RL.close(); process.exit(1); }
  ok(`Usando: ${path.basename(excelPath)}`);

  await run(excelPath);
  RL.close();
}

main().catch(e => { err('Error: ' + e.message); RL.close(); process.exit(1); });
