#!/usr/bin/env python3
"""
generar_municipios.py
Genera un documento Word por municipio en Reportes/<Mes>_<Año>/
Uso: python3 generar_municipios.py <excel_path> <mes> <año> <reportes_dir>
     python3 generar_municipios.py <excel_path> <mes> <año> <reportes_dir> --indices 14,37,20
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

# Filtro por índices numéricos (1-67) — sin problemas de encoding
# GENERAR_REPORTE.js pasa:  --indices 14,37,20
FILTRO_INDICES = None
if '--indices' in sys.argv:
    raw = sys.argv[sys.argv.index('--indices') + 1]
    FILTRO_INDICES = set(int(x.strip()) - 1 for x in raw.split(',') if x.strip().isdigit())

# Filtros de contenido (sexo y rangos de edad)
FILTRO_SEXO   = None   # 'm', 'h', o None = todos
FILTRO_RANGOS = None   # lista de claves de rango, o None = todos
if '--sexo' in sys.argv:
    FILTRO_SEXO = sys.argv[sys.argv.index('--sexo') + 1].strip().lower()
    if FILTRO_SEXO not in ('m', 'h'): FILTRO_SEXO = None
if '--rangos' in sys.argv:
    raw_r = sys.argv[sys.argv.index('--rangos') + 1]
    FILTRO_RANGOS = [r.strip() for r in raw_r.split(',') if r.strip()]
    if not FILTRO_RANGOS: FILTRO_RANGOS = None

SCRIPT_DIR = Path(__file__).parent
READER     = SCRIPT_DIR / 'read_excel_padron.py'
JS_BUILDER = SCRIPT_DIR / 'build_municipio.js'
CHART_GEN  = SCRIPT_DIR / 'generar_graficas_municipio.py'

import tempfile as _tempfile
_TMP_FD, _TMP_PATH = _tempfile.mkstemp(suffix='.json', prefix='mun_tmp_')
import os as _os; _os.close(_TMP_FD)
TMP_JSON = Path(_TMP_PATH)

SUB_DIR = REPORTES / f'{MES}_{ANO}'
SUB_DIR.mkdir(parents=True, exist_ok=True)

_meses_es = ['enero','febrero','marzo','abril','mayo','junio',
             'julio','agosto','septiembre','octubre','noviembre','diciembre']
_hoy = datetime.datetime.now()
fecha_str = f'{_hoy.day} de {_meses_es[_hoy.month-1]} de {_hoy.year}'

# ── Leer datos ────────────────────────────────────────────────────────────────
print('Leyendo datos del Excel...')
result = subprocess.run(['python3', str(READER), EXCEL], capture_output=True, text=True)
if result.returncode != 0:
    print('ERROR al leer el Excel:', result.stderr)
    sys.exit(1)
data = json.loads(result.stdout)

municipios     = data['municipios']
desglose       = data['desglose_municipal']
indicadores    = data.get('indicadores', [])
pob_estatal    = data.get('pob_estatal', 4043130)
pob_vulnerable = 1792324

# Localizables por programa+municipio (tabla C del Excel)
loc_data  = data.get('localizables', {})
prog_muns = loc_data.get('prog_muns', {})  # {"INST||PROG": {MUN: {m,h,total}}}

import unicodedata
def norm(s):
    if not s: return ''
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.strip().upper()

ind_gasto = {}
for p in indicadores:
    if p.get('gasto') and p.get('benef_reales') and p['benef_reales'] > 0:
        clave = norm(p['nombre'])
        ind_gasto[clave] = p['gasto'] / p['benef_reales']

# Lista ordenada alfabéticamente (igual que en GENERAR_REPORTE.js → leerMunicipios)
mun_reales = sorted([m for m in municipios if not m.get('especial')],
                    key=lambda x: x['municipio'])

if FILTRO_INDICES is not None:
    seleccionados = []
    for idx in sorted(FILTRO_INDICES):
        if 0 <= idx < len(mun_reales):
            seleccionados.append(mun_reales[idx])
        else:
            print(f'  Índice {idx+1} fuera de rango, ignorado.')
    mun_reales = seleccionados
    print(f'Generando {len(mun_reales)} municipio(s) seleccionado(s) en: {SUB_DIR}')
else:
    print(f'Generando {len(mun_reales)} documentos por municipio en: {SUB_DIR}')

ok_count  = 0
err_count = 0

for i, mun in enumerate(mun_reales):
    nombre   = mun['municipio']
    safe     = _norm(nombre).replace(' ', '_').replace('.', '').replace('/', '_')
    out_path = SUB_DIR / f'Municipio_{safe}.docx'

    # Gráficas
    charts = {}
    if CHART_GEN.exists():
        chart_input = json.dumps({
            'mun': mun,
            'desglose_mun': desglose.get(_norm(nombre), []),
            'pob_estatal': pob_estatal,
            'pob_vulnerable': pob_vulnerable,
        }, ensure_ascii=False, default=str)
        cr = subprocess.run(['python3', str(CHART_GEN)],
                            input=chart_input, capture_output=True, text=True)
        if cr.returncode == 0 and cr.stdout.strip():
            try: charts = json.loads(cr.stdout)
            except: pass

    # Enriquecer programas_detail con localizables por programa
    mun_key_loc = norm(nombre)   # clave normalizada del municipio
    progs_detail = mun.get('programas_detail', [])
    for prog in progs_detail:
        inst_p = norm(prog.get('institucion') or '')
        nom_p  = norm(prog.get('nombre') or '')
        nkey   = f'{inst_p}||{nom_p}'
        mun_data = prog_muns.get(nkey, {}).get(mun_key_loc, {})
        prog['loc_total'] = int(mun_data.get('total', 0))
        prog['loc_m']     = int(mun_data.get('m', 0))
        prog['loc_h']     = int(mun_data.get('h', 0))
    mun['programas_detail'] = progs_detail

    # Estimar gasto municipal
    gasto_mun_est = 0.0
    progs_con_gasto = 0
    for entry in desglose.get(_norm(nombre), []):
        prog_key = norm((entry.get('programa') or ''))
        if prog_key in ind_gasto:
            gasto_mun_est += ind_gasto[prog_key] * float(entry.get('total', 0) or 0)
            progs_con_gasto += 1
    gasto_mun_est = round(gasto_mun_est, 2) if gasto_mun_est > 0 else None

    # ── Filtros cruzados municipales (institución × sexo × rango de edad) ────
    RANGOS_ORDEN = ['0-5','6-11','12-17','18-29','30-49','50-64','65+','sin_datos']
    filtros_mun = {}
    for p in mun.get('programas_detail', []):
        inst_p = p.get('institucion', '')
        if not inst_p: continue
        if inst_p not in filtros_mun:
            filtros_mun[inst_p] = {r: {'m': 0.0, 'h': 0.0, 'total': 0.0} for r in RANGOS_ORDEN}
        for rango, rv in p.get('rangos', {}).items():
            if rango not in filtros_mun[inst_p]: continue
            if not isinstance(rv, dict): continue
            filtros_mun[inst_p][rango]['m']     += float(rv.get('m', 0) or 0)
            filtros_mun[inst_p][rango]['h']     += float(rv.get('h', 0) or 0)
            filtros_mun[inst_p][rango]['total'] += float(rv.get('total', 0) or 0)
    for inst_p, rangos_d in filtros_mun.items():
        filtros_mun[inst_p]['_totales'] = {
            'm':     sum(v['m']     for v in rangos_d.values() if isinstance(v, dict)),
            'h':     sum(v['h']     for v in rangos_d.values() if isinstance(v, dict)),
            'total': sum(v['total'] for v in rangos_d.values() if isinstance(v, dict)),
        }

    # Aplicar filtros de sesión: reducir filtros_mun a los datos solicitados
    filtro_activo = {'sexo': FILTRO_SEXO, 'rangos': FILTRO_RANGOS}
    if FILTRO_SEXO or FILTRO_RANGOS:
        for inst_p in list(filtros_mun.keys()):
            rd = filtros_mun[inst_p]
            rangos_a_incluir = FILTRO_RANGOS if FILTRO_RANGOS else RANGOS_ORDEN
            nuevo = {}
            for rango in rangos_a_incluir:
                if rango == '_totales': continue
                rv = rd.get(rango, {'m': 0.0, 'h': 0.0, 'total': 0.0})
                if FILTRO_SEXO == 'm':
                    nuevo[rango] = {'m': rv['m'], 'h': 0.0, 'total': rv['m']}
                elif FILTRO_SEXO == 'h':
                    nuevo[rango] = {'m': 0.0, 'h': rv['h'], 'total': rv['h']}
                else:
                    nuevo[rango] = rv
            nuevo['_totales'] = {
                'm':     sum(v['m']     for v in nuevo.values()),
                'h':     sum(v['h']     for v in nuevo.values()),
                'total': sum(v['total'] for v in nuevo.values()),
            }
            filtros_mun[inst_p] = nuevo



    payload = {
        'mun':             mun,
        'desglose_mun':    desglose.get(_norm(nombre), []),
        'gasto_mun_est':   gasto_mun_est,
        'progs_con_gasto': progs_con_gasto,
        'filtros_mun':     filtros_mun,
        'filtro_activo':   filtro_activo,
        'MES':             MES,
        'ANO':             ANO,
        'fecha_str':       fecha_str,
        'pob_estatal':     pob_estatal,
        'pob_vulnerable':  pob_vulnerable,
        'charts':          charts,
    }
    TMP_JSON.write_text(json.dumps(payload, ensure_ascii=False, default=str), encoding='utf-8')

    r = subprocess.run(
        ['node', str(JS_BUILDER), str(TMP_JSON), str(out_path)],
        capture_output=True, text=True
    )
    if r.returncode == 0 and out_path.exists():
        kb = os.path.getsize(out_path) // 1024
        ok_count += 1
        print(f'  [{i+1:2d}/{len(mun_reales)}] {nombre:<35s} {kb} KB')
    else:
        err_count += 1
        print(f'  [{i+1:2d}/{len(mun_reales)}] ERROR — {nombre}: {r.stderr[:120]}')

try: TMP_JSON.unlink()
except: pass

print(f'\n✓ {ok_count} documentos generados  |  {err_count} con error')
print(f'  Carpeta: {SUB_DIR}')
