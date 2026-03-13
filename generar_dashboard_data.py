#!/usr/bin/env python3
"""
generar_dashboard_data.py
=========================
Genera data_dashboard.js con los mismos datos y filtros que usan los reportes.

FILTROS REPLICADOS (idénticos a los builders):
  - General:      total_benef de gran_total; apoyos de total_apoyos_excel;
                  programas con >= 10 beneficiarios; ap_clean excluye INST_NAMES_UP
  - Municipal:    desglose con total > 0; municipios reales (no especiales)
  - Institucional: apoyos de apoyos_g3; programas con >= 2 apoyos en prog_apoyos

Uso:
  python3 generar_dashboard_data.py <excel_path>         → genera data_dashboard.js
  python3 generar_dashboard_data.py <excel_path> --json  → imprime JSON puro (debug)

El HTML del dashboard importa data_dashboard.js para leer window.DASHBOARD_DATA.
"""

import sys, json, subprocess
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
READER     = SCRIPT_DIR / 'read_excel_padron.py'

# ── Constantes (mismas que motor_reporte_padron.py) ──────────────────────────
POB_ESTATAL    = 4_043_130
POB_VULNERABLE = 1_792_324

# Instituciones/nombres excluidos del listado de tipos de apoyo (mismo filtro que motor_reporte_padron.py)
INST_NAMES_UP = {
    'CECYTECH','COESPO','COESVI','DIF','ICHD','ICHDII','ICHIJUV','ICHIMUJ',
    'RURAL','SALUD','SDBYBC','SDHyBC','SDHYBC','SEECH','SEYD','SEyD',
    'SPyCI','SPYCI','TRABAJO','TURISMO','CULTURA','MEDICHIHUAHUA',
    'DESARROLLO HUMANO','NO IDENTIFICADO',
}

def sf(v):
    try: return float(v or 0)
    except: return 0.0

def pct(part, total):
    if not total: return 0.0
    return round(float(part) / float(total) * 100, 1)

# ── Leer datos crudos del Excel ───────────────────────────────────────────────
def leer_excel(excel_path):
    result = subprocess.run(
        ['python3', str(READER), str(excel_path)],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print('ERROR al leer el Excel:', result.stderr, file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)

# ── Construir payload del dashboard ──────────────────────────────────────────
def leer_grupos_vulnerables(excel_path):
    """Lee la hoja Grupos Vulnerables directamente con openpyxl."""
    try:
        import openpyxl
        wb = openpyxl.load_workbook(str(excel_path), data_only=True)
        if 'Grupos Vulnerables' not in wb.sheetnames:
            return {}
        ws = wb['Grupos Vulnerables']
        result = {}
        for row in ws.iter_rows(min_row=2, values_only=True):
            if not row[0]:
                continue
            genero = str(row[0]).strip().lower()
            pob_vul = int(row[1]) if row[1] else 0
            pob_ate = int(row[2]) if row[2] else 0
            if 'muj' in genero:
                result['mujeres'] = {'pob_vulnerable': pob_vul, 'atendidas': pob_ate}
            elif 'hom' in genero:
                result['hombres'] = {'pob_vulnerable': pob_vul, 'atendidos': pob_ate}
        return result
    except Exception as e:
        print(f'AVISO: No se pudo leer Grupos Vulnerables: {e}', file=sys.stderr)
        return {}


def leer_nutrichihuahua(excel_path):
    """Lee la hoja Nutrichihuahua directamente con openpyxl."""
    try:
        import openpyxl
        wb = openpyxl.load_workbook(str(excel_path), data_only=True)
        if 'Nutrichihuahua' not in wb.sheetnames:
            return {}
        ws = wb['Nutrichihuahua']
        result = {}
        for row in ws.iter_rows(min_row=2, values_only=True):
            if row[0] and row[1] is not None:
                result[str(row[0]).strip()] = int(row[1]) if row[1] else 0
        return result
    except Exception as e:
        print(f'AVISO: No se pudo leer Nutrichihuahua: {e}', file=sys.stderr)
        return {}


def build_dashboard_data(raw, excel_path=None):
    gt            = raw['gran_total']
    rangos        = raw['rangos_edad']            # col de rangos globales
    rangos_mh     = raw.get('rangos_mh_global', {})  # col S: desglose M/H
    instituciones = raw['instituciones']          # 5 instituciones principales
    municipios    = raw['municipios']             # lista completa
    apoyos        = raw['apoyos']                 # listado de tipos de apoyo
    loc           = raw.get('localizables', {})
    indicadores   = raw.get('indicadores', [])
    apoyos_g3     = raw.get('apoyos_g3', {})      # apoyos por institución (hoja 3)
    desglose_mun  = raw.get('desglose_municipal', {})  # {mun: [entries]}

    # ══ FILTROS REPORTE GENERAL ══════════════════════════════════════════════

    # Beneficiarios únicos — directo de gran_total (mismo que reporte)
    total_benef = int(sf(gt.get('total', 0)))
    total_m     = int(sf(gt.get('m', 0)))
    total_h     = int(sf(gt.get('h', 0)))
    total_sn    = int(sum(sf(v.get('sn', 0)) for v in instituciones.values()))

    # Apoyos — total directo del Excel (fila TOTAL de Apoyos Otorgados)
    total_apoyos = int(sf(raw.get('total_apoyos_excel', 0)))

    # Instituciones activas (>= 10 beneficiarios)
    inst_act = [k for k, v in instituciones.items() if sf(v.get('total', 0)) >= 10]
    total_inst = len(inst_act)
    total_prog = sum(len(v.get('programas', [])) for v in instituciones.values())

    # Tipos de apoyo limpios (excluye nombres de instituciones/placeholders)
    ap_clean = [a for a in apoyos
                if str(a.get('apoyo', '')).upper().strip() not in INST_NAMES_UP]

    # ── Rangos de edad (fuente: col S del Excel, con desglose M/H) ──────────
    edad_labels = [
        ('0 - 5 años',       '0-5'),
        ('6 - 11 años',      '6-11'),
        ('12 - 17 años',     '12-17'),
        ('18 - 29 años',     '18-29'),
        ('30 - 49 años',     '30-49'),
        ('50 - 64 años',     '50-64'),
        ('65 años o más',    '65+'),
        ('Sin dato de edad', 'sin_datos'),
    ]
    rangos_data = []
    for label, key in edad_labels:
        t_e  = int(sf(rangos.get(key, 0)))
        mh   = rangos_mh.get(key, {})
        m_e  = int(sf(mh.get('m', 0)))
        h_e  = int(sf(mh.get('h', 0)))
        sn_e = int(sf(mh.get('sn', max(0, t_e - m_e - h_e))))
        rangos_data.append({
            'label': label, 'key': key,
            'total': t_e, 'm': m_e, 'h': h_e, 'sn': sn_e,
            'pct_total': pct(t_e, total_benef),
        })

    # Grupos de edad simplificados (igual que reporte)
    ninos   = int(sf(rangos.get('0-5', 0)))   + int(sf(rangos.get('6-11', 0)))
    jovenes = int(sf(rangos.get('12-17', 0))) + int(sf(rangos.get('18-29', 0)))
    adultos = int(sf(rangos.get('30-49', 0))) + int(sf(rangos.get('50-64', 0)))
    mayores = int(sf(rangos.get('65+', 0)))

    # ── Localizables ─────────────────────────────────────────────────────────
    loc_total = int(loc.get('total', 0))
    loc_m     = int(loc.get('m', 0))
    loc_h     = int(loc.get('h', 0))
    loc_inst_raw = loc.get('por_institucion', [])  # [{nombre,m,h,total}]
    loc_rangos   = loc.get('rangos_edad', {})

    # Localizables por municipio — del objeto municipios (enriquecido por read_excel)
    loc_por_municipio = {}
    for mun in municipios:
        if not mun.get('especial'):
            nombre = mun['municipio']
            loc_por_municipio[nombre] = {
                'total': int(mun.get('total_localizables', 0)),
                'm':     int(mun.get('loc_m', 0)),
                'h':     int(mun.get('loc_h', 0)),
            }

    # ── Instituciones (para tab Instituciones) ────────────────────────────────
    instituciones_data = {}
    for inst_name, v in instituciones.items():
        tot = int(sf(v.get('total', 0)))
        if tot == 0:
            continue
        # Apoyos de esta institución desde apoyos_g3 (mismo que reporte general sec. 4)
        g3_inst         = apoyos_g3.get(inst_name, {})
        tot_apoyos_inst = int(sf(g3_inst.get('total', 0)))
        g3_progs        = g3_inst.get('programas', {})

        # Programas con apoyos >= 2 (filtro build_institucion.js línea 406)
        prog_apoyos_filtrado = {k: int(sf(v2)) for k, v2 in g3_progs.items()
                                if sf(v2) >= 2}

        programas = []
        for p in sorted(v.get('programas', []), key=lambda x: -sf(x.get('total', 0))):
            # Buscar apoyos con normalización tolerante a tildes
            def norm(s):
                import unicodedata
                return unicodedata.normalize('NFD', (s or '').upper()).encode('ascii', 'ignore').decode()
            ap_prog = prog_apoyos_filtrado.get(p['nombre'], 0)
            if not ap_prog:
                for k, val in prog_apoyos_filtrado.items():
                    if norm(k) == norm(p['nombre']):
                        ap_prog = val
                        break
            programas.append({
                'nombre':  p['nombre'],
                'total':   int(sf(p.get('total', 0))),
                'm':       int(sf(p.get('m', 0))),
                'h':       int(sf(p.get('h', 0))),
                'sn':      int(sf(p.get('sn', 0))),
                'apoyos':  ap_prog,
            })

        rangos_inst = v.get('rangos', {})
        instituciones_data[inst_name] = {
            'total':       tot,
            'm':           int(sf(v.get('m', 0))),
            'h':           int(sf(v.get('h', 0))),
            'sn':          int(sf(v.get('sn', 0))),
            'apoyos':      tot_apoyos_inst,
            'programas':   programas,
            'rangos':      {k: int(sf(rangos_inst.get(k, 0)))
                           for k in ['0-5','6-11','12-17','18-29','30-49','50-64','65+','sin_datos']},
        }

    # ── Municipios (para tab Municipios) ──────────────────────────────────────
    # Sólo municipios reales (no especiales), ordenados por volumen desc
    municipios_data = []
    mun_reales = sorted([m for m in municipios if not m.get('especial')],
                        key=lambda x: -x.get('total', 0))
    for m in mun_reales:
        nom = m['municipio']
        municipios_data.append({
            'nombre':      nom,
            'total':       int(m.get('total', 0)),
            'm':           int(m.get('m', 0)),
            'h':           int(m.get('h', 0)),
            'sn':          int(m.get('sn', 0)),
            'poblacion':   int(m.get('poblacion', 0)),
            'total_apoyos': int(m.get('total_apoyos', 0)),
            'n_programas': int(m.get('n_programas', 0)),
            'localizables': int(m.get('total_localizables', 0)),
            'loc_m':       int(m.get('loc_m', 0)),
            'loc_h':       int(m.get('loc_h', 0)),
        })

    # Municipios especiales (Foráneo, No identificado)
    mun_especiales = []
    for m in [x for x in municipios if x.get('especial')]:
        mun_especiales.append({
            'nombre': m['municipio'],
            'total':  int(m.get('total', 0)),
            'm':      int(m.get('m', 0)),
            'h':      int(m.get('h', 0)),
        })

    # ── Apoyos (para tab Apoyos) — con árbol Apoyo > Inst > Prog ─────────────
    # Árbol desde desglose_municipal (mismo que reporte general sec. 6)
    apoyo_tree = {}
    for mun_k, entries in desglose_mun.items():
        for e in entries:
            ap_nom = e.get('apoyo', '')
            ins    = e.get('institucion', '')
            prog   = e.get('programa', '') or '(sin programa)'
            if not ap_nom or not ins:
                continue
            apoyo_tree.setdefault(ap_nom, {})
            apoyo_tree[ap_nom].setdefault(ins, {})
            apoyo_tree[ap_nom][ins].setdefault(prog, {'m': 0, 'h': 0, 'total': 0, 'muns': set()})
            apoyo_tree[ap_nom][ins][prog]['m']     += int(sf(e.get('m', 0)))
            apoyo_tree[ap_nom][ins][prog]['h']     += int(sf(e.get('h', 0)))
            apoyo_tree[ap_nom][ins][prog]['total'] += int(sf(e.get('total', 0)))
            apoyo_tree[ap_nom][ins][prog]['muns'].add(mun_k)

    apoyos_data = []
    for a in ap_clean:
        nombre_apoyo = a.get('apoyo', '')
        inst_tree    = apoyo_tree.get(nombre_apoyo, {})
        insts = []
        for ins_k, prog_tree in sorted(inst_tree.items(),
                                       key=lambda x: -sum(v['total'] for v in x[1].values())):
            ins_total = sum(v['total'] for v in prog_tree.values())
            ins_m     = sum(v['m']     for v in prog_tree.values())
            ins_h     = sum(v['h']     for v in prog_tree.values())
            ins_muns  = set()
            for v in prog_tree.values():
                ins_muns |= v['muns']
            progs_list = []
            for prog_k, pv in sorted(prog_tree.items(), key=lambda x: -x[1]['total']):
                progs_list.append({
                    'nombre': prog_k,
                    'total':  pv['total'],
                    'm':      pv['m'],
                    'h':      pv['h'],
                    'muns':   len(pv['muns']),
                })
            insts.append({
                'nombre': ins_k,
                'total':  ins_total,
                'm':      ins_m,
                'h':      ins_h,
                'muns':   len(ins_muns),
                'programas': progs_list,
            })
        apoyos_data.append({
            'nombre':    nombre_apoyo,
            'total':     int(sf(a.get('total', 0))),
            'm':         int(sf(a.get('m', 0))),
            'h':         int(sf(a.get('h', 0))),
            'n_muns':    int(sf(a.get('n_municipios', 0))),
            'pct':       pct(sf(a.get('total', 0)), total_apoyos),
            'instituciones': insts,
        })

    # ── Apoyos por institución (hoja 3) ──────────────────────────────────────
    apoyos_g3_summary = {}
    for inst_k, v in apoyos_g3.items():
        apoyos_g3_summary[inst_k] = {
            'total': int(sf(v.get('total', 0))),
            'm':     int(sf(v.get('m', 0))),
            'h':     int(sf(v.get('h', 0))),
        }

    # ── Indicadores y metas ───────────────────────────────────────────────────
    indicadores_data = []
    for ind in indicadores:
        indicadores_data.append({
            'inst':        ind.get('institucion', ''),
            'clave':       ind.get('clave', ''),
            'nombre':      ind.get('nombre', ''),
            'benef_reales': int(sf(ind.get('benef_reales', 0))) if ind.get('benef_reales') else None,
            'presupuesto': ind.get('presupuesto'),
            'gasto':       ind.get('gasto'),
        })

    # ── Presupuesto global (igual que reporte general) ────────────────────────
    pres_vals  = [float(p['presupuesto']) for p in indicadores if p.get('presupuesto') and float(p.get('presupuesto', 0)) > 0]
    gasto_vals = [float(p['gasto'])       for p in indicadores if p.get('gasto')       and float(p.get('gasto', 0)) > 0]
    pres_total  = sum(pres_vals)
    gasto_total = sum(gasto_vals)

    # ── Localizables rangos de edad ────────────────────────────────────────────
    loc_rangos_data = []
    for label, key in edad_labels:
        if key == 'sin_datos':
            continue
        t_e = int(sf(loc_rangos.get(key, 0)))
        loc_rangos_data.append({'label': label, 'key': key, 'total': t_e})

    # ── Grupos Vulnerables y NutriChihuahua ──────────────────────────────────
    grupos_vul   = leer_grupos_vulnerables(excel_path) if excel_path else {}
    nutrichi     = leer_nutrichihuahua(excel_path)     if excel_path else {}

    # Recalcular pob_vulnerable total desde Excel si hay datos reales
    gv_m   = grupos_vul.get('mujeres', {}).get('pob_vulnerable', 0) or 0
    gv_h   = grupos_vul.get('hombres', {}).get('pob_vulnerable', 0) or 0
    pob_vul_real = (gv_m + gv_h) if (gv_m + gv_h) > 0 else POB_VULNERABLE

    # ══ PAYLOAD FINAL ════════════════════════════════════════════════════════
    return {
        '_meta': {
            'pob_estatal':    POB_ESTATAL,
            'pob_vulnerable': pob_vul_real,
            'pob_vul_m':      gv_m,
            'pob_vul_h':      gv_h,
            'fuente':         'Padrón de Beneficiarios — SDHyBC Chihuahua',
        },
        # Reporte General
        'general': {
            'total_benef':   total_benef,
            'total_m':       total_m,
            'total_h':       total_h,
            'total_sn':      total_sn,
            'total_apoyos':  total_apoyos,
            'total_inst':    total_inst,
            'total_prog':    total_prog,
            'mun_activos':   67,
            'ninos':         ninos,
            'jovenes':       jovenes,
            'adultos':       adultos,
            'mayores':       mayores,
            'cob_estatal_pct':  pct(total_benef, POB_ESTATAL),
            'cob_vulnerable_pct': pct(total_benef, POB_VULNERABLE),
            'pres_total':    pres_total,
            'gasto_total':   gasto_total,
            'gasto_x_ben':   (gasto_total / total_benef) if total_benef and gasto_total else 0,
        },
        'rangos_edad': rangos_data,
        # Localizables
        'localizables': {
            'total': loc_total,
            'm':     loc_m,
            'h':     loc_h,
            'pct_del_padron': pct(loc_total, total_benef),
            'por_institucion': sorted(
                [{'nombre': x['nombre'], 'total': x['total'], 'm': x['m'], 'h': x['h']}
                 for x in loc_inst_raw],
                key=lambda x: -x['total']
            ),
            'por_municipio': loc_por_municipio,
            'rangos_edad':   loc_rangos_data,
        },
        # Instituciones
        'instituciones': instituciones_data,
        # Municipios
        'municipios': municipios_data,
        'municipios_especiales': mun_especiales,
        # Apoyos
        'apoyos': apoyos_data,
        'apoyos_g3': apoyos_g3_summary,
        # Indicadores
        'indicadores': indicadores_data,
        # Grupos Vulnerables (hoja nueva)
        'grupos_vulnerables': grupos_vul,
        # NutriChihuahua (hoja nueva)
        'nutrichihuahua': nutrichi,
    }


def main():
    if len(sys.argv) < 2:
        print('Uso: python3 generar_dashboard_data.py <excel_path> [--json]', file=sys.stderr)
        sys.exit(1)

    excel_path = Path(sys.argv[1])
    if not excel_path.exists():
        print(f'ERROR: no existe {excel_path}', file=sys.stderr)
        sys.exit(1)

    modo_json = '--json' in sys.argv

    print('Leyendo Excel...', file=sys.stderr)
    raw  = leer_excel(excel_path)
    print('Aplicando filtros...', file=sys.stderr)
    data = build_dashboard_data(raw, excel_path=excel_path)

    if modo_json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return

    # Generar data_dashboard.js junto al dashboard HTML
    out_js = SCRIPT_DIR / 'data_dashboard.js'
    payload = json.dumps(data, ensure_ascii=False)
    with open(out_js, 'w', encoding='utf-8') as f:
        f.write('// Generado automáticamente por generar_dashboard_data.py\n')
        f.write('// NO editar manualmente — se sobreescribe con cada actualización del Excel.\n')
        f.write(f'window.DASHBOARD_DATA = {payload};\n')

    kb = out_js.stat().st_size // 1024
    print(f'✓ data_dashboard.js generado ({kb} KB) → {out_js}', file=sys.stderr)
    print(f'  Beneficiarios únicos : {data["general"]["total_benef"]:,}', file=sys.stderr)
    print(f'  Apoyos otorgados     : {data["general"]["total_apoyos"]:,}', file=sys.stderr)
    print(f'  Municipios activos   : {data["general"]["mun_activos"]}', file=sys.stderr)
    print(f'  Instituciones activas: {data["general"]["total_inst"]}', file=sys.stderr)
    print(f'  Localizables         : {data["localizables"]["total"]:,}', file=sys.stderr)
    if data.get('grupos_vulnerables'):
        gv = data['grupos_vulnerables']
        print(f'  Pob. Vul. Mujeres    : {gv.get("mujeres",{}).get("pob_vulnerable",0):,}', file=sys.stderr)
        print(f'  Pob. Vul. Hombres    : {gv.get("hombres",{}).get("pob_vulnerable",0):,}', file=sys.stderr)
    if data.get('nutrichihuahua') and data['nutrichihuahua']:
        print(f'  NutriChihuahua       : {len(data["nutrichihuahua"])} registros', file=sys.stderr)


if __name__ == '__main__':
    main()
