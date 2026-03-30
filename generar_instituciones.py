#!/usr/bin/env python3
"""
generar_instituciones.py
Genera un documento Word por institución en Reportes/<Mes>_<Año>/
Uso: python3 generar_instituciones.py <excel_path> <mes> <año> <reportes_dir>
     python3 generar_instituciones.py <excel_path> <mes> <año> <reportes_dir> --indices 1,3
"""
import sys, json, subprocess, os, datetime
from pathlib import Path

EXCEL    = sys.argv[1]
MES      = sys.argv[2]
ANO      = sys.argv[3]
REPORTES = Path(sys.argv[4])

import unicodedata as _ud
def _norm(s):
    return _ud.normalize('NFD', s.upper()).encode('ascii', 'ignore').decode()

# Filtro opcional por índices (1-based)
FILTRO_INDICES = None
if '--indices' in sys.argv:
    raw = sys.argv[sys.argv.index('--indices') + 1]
    FILTRO_INDICES = set(int(x.strip()) - 1 for x in raw.split(',') if x.strip().isdigit())

# Filtros de contenido
FILTRO_SEXO   = None
FILTRO_RANGOS = None
if '--sexo' in sys.argv:
    FILTRO_SEXO = sys.argv[sys.argv.index('--sexo') + 1].strip().lower()
    if FILTRO_SEXO not in ('m', 'h'): FILTRO_SEXO = None
if '--rangos' in sys.argv:
    raw_r = sys.argv[sys.argv.index('--rangos') + 1]
    FILTRO_RANGOS = [r.strip() for r in raw_r.split(',') if r.strip()]
    if not FILTRO_RANGOS: FILTRO_RANGOS = None

SCRIPT_DIR = Path(__file__).parent
READER     = SCRIPT_DIR / 'read_excel_padron.py'
JS_BUILDER = SCRIPT_DIR / 'build_institucion.js'

import tempfile as _tempfile
import os as _os
_TMP_FD, _TMP_PATH = _tempfile.mkstemp(suffix='.json', prefix='inst_tmp_')
_os.close(_TMP_FD)
TMP_JSON = Path(_TMP_PATH)

SUB_DIR = REPORTES / f'{MES}_{ANO}'
SUB_DIR.mkdir(parents=True, exist_ok=True)

_meses_es = ['enero','febrero','marzo','abril','mayo','junio',
             'julio','agosto','septiembre','octubre','noviembre','diciembre']
_hoy = datetime.datetime.now()
fecha_str = f'{_hoy.day} de {_meses_es[_hoy.month-1]} de {_hoy.year}'

# ── Leer datos ────────────────────────────────────────────────────────────────
print('Leyendo datos del Excel...')
result = subprocess.run(['python3', str(READER), EXCEL],
                        stdin=subprocess.DEVNULL, capture_output=True, text=True)
if result.returncode != 0:
    print('ERROR al leer el Excel:', result.stderr); sys.exit(1)
data = json.loads(result.stdout)

instituciones  = data['instituciones']    # {key: {total,m,h,sn,rangos,programas}}
desglose       = data['desglose_municipal']  # {mun_norm: [{apoyo,programa,institucion,total,...}]}
pob_estatal    = data.get('pob_estatal', 4043130)
pob_municipal  = data.get('pob_municipal', {})
pob_vulnerable = 1792324

# Ordenar instituciones por total de beneficiarios
inst_list = sorted(instituciones.items(), key=lambda x: -float(x[1].get('total',0) or 0))

if FILTRO_INDICES is not None:
    inst_list = [inst_list[i] for i in sorted(FILTRO_INDICES) if 0 <= i < len(inst_list)]
    print(f'Generando {len(inst_list)} institución(es) seleccionada(s) en: {SUB_DIR}')
else:
    print(f'Generando {len(inst_list)} documentos por institución en: {SUB_DIR}')

def _desc_filtro(sexo, rangos):
    partes = []
    if sexo == 'm': partes.append('Mujeres')
    elif sexo == 'h': partes.append('Hombres')
    if rangos: partes.append('rangos ' + ', '.join(rangos))
    return ' · '.join(partes) if partes else 'Datos completos'

ok_count = err_count = 0

for idx, (inst_key, inst_data) in enumerate(inst_list):
    safe     = _norm(inst_key).replace(' ','_').replace('.','').replace('/','_')
    out_path = SUB_DIR / f'Institucion_{safe}.docx'

    # ── Localizables de la institución (fuente: tablas A/B/C de Beneficiarios Localizables) ──
    loc_inst = next((x for x in data.get('localizables',{}).get('por_institucion',[])
                     if x['nombre'] == inst_key), None)
    loc_total    = float(loc_inst['total'])    if loc_inst else 0.0
    loc_m_inst   = float(loc_inst['m'])        if loc_inst else 0.0
    loc_h_inst   = float(loc_inst['h'])        if loc_inst else 0.0
    loc_rangos   = loc_inst.get('rangos', {})  if loc_inst else {}
    loc_municipios = {m: v for m, v in (loc_inst.get('municipios', {}) if loc_inst else {}).items()
                      if float(v.get('total', 0) or 0) > 0}

    # ── Gasto estimado institucional ──────────────────────────────────────────
    indicadores    = data.get('indicadores', [])
    def _norm_g(s):
        if not s: return ''
        s = _ud.normalize('NFD', s)
        return ''.join(c for c in s if _ud.category(c) != 'Mn').strip().upper()
    ind_gasto = {}
    for p in indicadores:
        if p.get('gasto') and p.get('benef_reales') and p['benef_reales'] > 0:
            ind_gasto[_norm_g(p['nombre'])] = p['gasto'] / p['benef_reales']
    gasto_inst_est  = 0.0
    progs_con_gasto = 0
    for mun_key, entries in desglose.items():
        for e in entries:
            if e.get('institucion') == inst_key:
                pk = _norm_g(e.get('programa') or '')
                if pk in ind_gasto:
                    gasto_inst_est  += ind_gasto[pk] * float(e.get('total', 0) or 0)
                    progs_con_gasto += 1
    gasto_inst_est = round(gasto_inst_est, 2) if gasto_inst_est > 0 else None

    # ── Beneficiarios únicos por municipio (subtotal de fila institución en el Excel) ──
    # Usamos inst_subtotales: el Excel ya deduplica beneficiarios en esa fila
    mun_benef = {}
    ESPECIALES_MUN = {'NO IDENTIFICADO', 'FORÁNEO', 'FORANEO', 'SIN IDENTIFICAR'}
    for mun_obj in data['municipios']:
        mun_name = mun_obj.get('municipio', '')
        if mun_name.upper().strip() in {x.upper() for x in ESPECIALES_MUN}: continue
        sub = mun_obj.get('inst_subtotales', {}).get(inst_key)
        if sub and float(sub.get('total', 0) or 0) > 0:
            mun_benef[mun_name] = {
                'm':     float(sub.get('m', 0) or 0),
                'h':     float(sub.get('h', 0) or 0),
                'total': float(sub.get('total', 0) or 0),
            }

    # ── Construir desglose por institución ───────────────────────────────────
    # mun_apoyos_norm: {norm(mun): total_apoyos} para match sin tilde
    def _norm_mun(s): return _ud.normalize('NFD', s.upper()).encode('ascii','ignore').decode()

    desglose_inst = []
    mun_apoyos_norm = {}   # {norm_key: total_apoyos}
    total_apoyos_inst = 0.0

    for mun_key, entries in desglose.items():
        for e in entries:
            if e.get('institucion') == inst_key:
                mun_real = e.get('municipio') or mun_key
                t = float(e.get('total', 0) or 0)
                desglose_inst.append({
                    'municipio':  mun_real,
                    'mun_norm':   _norm_mun(mun_key),
                    'apoyo':      e.get('apoyo', '—'),
                    'programa':   e.get('programa', '—'),
                    'total':      t,
                    'm':          e.get('m', 0),
                    'h':          e.get('h', 0),
                })
                mun_apoyos_norm[_norm_mun(mun_key)] = mun_apoyos_norm.get(_norm_mun(mun_key), 0) + t

    # Apoyos por programa y total desde tabla G3 (fuente directa del Excel)
    g3_inst = data.get('apoyos_g3', {}).get(inst_key, {})
    prog_apoyos = {p: float(v.get('total', 0) or 0)
                   for p, v in g3_inst.get('programas', {}).items()}
    total_apoyos_inst = float(g3_inst.get('total', 0) or 0)

    # Presupuesto y gasto desde Indicadores y Metas (por institucion)
    ind_inst   = [p for p in indicadores if p.get('institucion') == inst_key]
    pres_vals  = [float(p['presupuesto']) for p in ind_inst if p.get('presupuesto') is not None]
    gasto_vals = [float(p['gasto'])       for p in ind_inst if p.get('gasto')       is not None]
    pres_total_inst  = round(sum(pres_vals),  2) if pres_vals  else None
    gasto_total_inst = round(sum(gasto_vals), 2) if gasto_vals else None

    # Apoyo+programa con mayor gasto estimado (desde desglose x gasto_por_benef)
    top_gasto_item = None
    top_gasto_val  = 0.0
    for e in desglose_inst:
        pk = _norm_g(e.get('programa') or '')
        if pk in ind_gasto:
            gasto_e = ind_gasto[pk] * float(e.get('total', 0) or 0)
            if gasto_e > top_gasto_val:
                top_gasto_val  = gasto_e
                top_gasto_item = {
                    'apoyo':    e.get('apoyo', '-'),
                    'programa': e.get('programa', '-'),
                    'gasto':    round(gasto_e, 2),
                }
    if top_gasto_val == 0:
        top_gasto_item = None

    # ── Gráficas ─────────────────────────────────────────────────────────────
    charts = {}
    chart_gen = SCRIPT_DIR / 'generar_graficas_institucion.py'
    if chart_gen.exists():
        chart_input = json.dumps({
            'inst_key':      inst_key,
            'inst':          inst_data,
            'desglose_inst': desglose_inst,
            'pob_vulnerable': pob_vulnerable,
            'pob_estatal':   pob_estatal,
            'loc_total':     loc_total,
            'loc_m_inst':    loc_m_inst,
            'loc_h_inst':    loc_h_inst,
        }, ensure_ascii=False, default=str)
        cr = subprocess.run(['python3', str(chart_gen)],
                            input=chart_input, capture_output=True, text=True)
        if cr.returncode == 0 and cr.stdout.strip():
            try: charts = json.loads(cr.stdout)
            except: pass

    # ── Filtros cruzados institucionales (sexo × rango de edad) ──────────────
    # Para cualquier combinación de filtros, llamamos calcular_filtro() directamente
    # desde el Excel via un script auxiliar. Esto garantiza que rangos arbitrarios
    # (ej. 12-29, 0-17, 18-64) sean siempre correctos sin depender de pre-calculados.
    filtros_inst_raw = data.get('filtros_cruzados', {}).get(inst_key, {})
    filtro_activo = {'sexo': FILTRO_SEXO, 'rangos': FILTRO_RANGOS}
    hay_filtro = bool(FILTRO_SEXO or FILTRO_RANGOS)

    def _llamar_calcular_filtro(excel, inst_k, sexo_f, rangos_f):
        """Llama a calcular_filtro() via subprocess auxiliar para cualquier combinación."""
        script = f"""
import sys, json
sys.argv = ['x', {repr(str(excel))}]
# Cargar solo las funciones del parser sin ejecutar el bloque MAIN
_src = open({repr(str(SCRIPT_DIR / 'read_excel_padron.py'))}).read()
_stop = _src.find('instituciones, rangos, gran_total')
exec(_src[:_stop])
# Llamar calcular_filtro con los parámetros solicitados
result = calcular_filtro(
    {{}}, [],
    inst_key={repr(inst_k)},
    sexo={repr(sexo_f)},
    rangos_edad={repr(rangos_f)},
)
print(json.dumps(result, ensure_ascii=False, default=str))
"""
        r = subprocess.run(['python3', '-c', script],
                           capture_output=True, text=True, stdin=subprocess.DEVNULL)
        if r.returncode == 0 and r.stdout.strip():
            try: return json.loads(r.stdout)
            except: pass
        return {}

    if hay_filtro:
        fi = _llamar_calcular_filtro(EXCEL, inst_key, FILTRO_SEXO, FILTRO_RANGOS)
        filtros_inst = {'global': fi, **filtros_inst_raw}

        loc_fi = fi.get('localizables', {})
        kpis_filtrados = {
            'total':               float(fi.get('total', 0) or 0),
            'm':                   float(fi.get('m', 0) or 0),
            'h':                   float(fi.get('h', 0) or 0),
            'sn':                  float(fi.get('sn', 0) or 0),
            'total_apoyos':        float(fi.get('total_apoyos', 0) or 0),
            'loc_total':           float(loc_fi.get('total', 0) or 0),
            'loc_m':               float(loc_fi.get('m', 0) or 0),
            'loc_h':               float(loc_fi.get('h', 0) or 0),
            'loc_por_rango':       loc_fi.get('por_rango', {}),
            'loc_por_municipio':   loc_fi.get('por_municipio', []),
            'por_rango':           fi.get('por_rango', {}),
            'por_municipio':       fi.get('por_municipio', []),
            'por_programa':        fi.get('por_programa', []),
            'apoyos_por_tipo':     fi.get('apoyos_por_tipo', []),
            'apoyos_por_programa': fi.get('apoyos_por_programa', []),
            'filtro_desc':         _desc_filtro(FILTRO_SEXO, FILTRO_RANGOS),
        }
    else:
        filtros_inst  = filtros_inst_raw
        kpis_filtrados = None

    # Además, calcular filtros por municipio × institución para cruce ad-hoc
    # Estructura: {mun_norm: {sexo: {rango: n}}}
    # Construido desde programas_detail de cada municipio (hoja 2 del Excel)
    def _calc_mun_inst_filtros(municipios_data, inst_k):
        resultado = {}
        for mun_obj in municipios_data:
            if mun_obj.get('especial'): continue
            mun_n = _norm(mun_obj['municipio'])
            acum = {'m': {}, 'h': {}, 'total': {}}
            for p in mun_obj.get('programas_detail', []):
                if _norm(p.get('institucion', '')) != _norm(inst_k): continue
                for rango, rv in p.get('rangos', {}).items():
                    if not isinstance(rv, dict): continue
                    for sexo in ('m', 'h', 'total'):
                        acum[sexo][rango] = acum[sexo].get(rango, 0.0) + float(rv.get(sexo, 0) or 0)
            if any(acum['total'].values()):
                resultado[mun_n] = acum
        return resultado

    filtros_mun_inst = _calc_mun_inst_filtros(data['municipios'], inst_key)

    # ── Payload ───────────────────────────────────────────────────────────────
    payload = {
        'inst_key':      inst_key,
        'inst':          inst_data,
        'desglose_inst': desglose_inst,
        'MES':           MES,
        'ANO':           ANO,
        'fecha_str':     fecha_str,
        'pob_estatal':   pob_estatal,
        'pob_vulnerable': pob_vulnerable,
        'pob_municipal':  pob_municipal,
        'mun_benef':      mun_benef,
        'loc_total':      loc_total,
        'loc_rangos':     loc_rangos,
        'loc_municipios': loc_municipios,
        'loc_m_inst':     loc_m_inst,
        'loc_h_inst':     loc_h_inst,
        'gasto_inst_est': gasto_inst_est,
        'progs_con_gasto': progs_con_gasto,
        'mun_apoyos_norm': mun_apoyos_norm,
        'apoyos_a3_inst': data.get('apoyos_a3', {}).get(inst_key, {}),
        'prog_apoyos':    prog_apoyos,
        'total_apoyos_inst': total_apoyos_inst,
        'pres_total_inst':   pres_total_inst,
        'gasto_total_inst':  gasto_total_inst,
        'top_gasto_item':    top_gasto_item,
        'filtros_inst':      filtros_inst,
        'filtros_mun_inst':  filtros_mun_inst,
        'filtro_activo':     filtro_activo,
        'kpis_filtrados':    kpis_filtrados,
        'charts':        charts,
    }
    TMP_JSON.write_text(json.dumps(payload, ensure_ascii=False, default=str), encoding='utf-8')

    r = subprocess.run(
        ['node', str(JS_BUILDER), str(TMP_JSON), str(out_path)],
        capture_output=True, text=True
    )
    if r.returncode == 0 and out_path.exists():
        kb = os.path.getsize(out_path) // 1024
        ok_count += 1
        print(f'  [{idx+1:2d}/{len(inst_list)}] {inst_key:<20s} {kb} KB')
    else:
        err_count += 1
        print(f'  [{idx+1:2d}/{len(inst_list)}] ERROR — {inst_key}: {r.stderr[:120]}')

try: TMP_JSON.unlink()
except: pass

print(f'\n✓ {ok_count} documentos generados  |  {err_count} con error')
print(f'  Carpeta: {SUB_DIR}')
