import json
import math
import re
import unicodedata
from collections import defaultdict
from datetime import date, datetime
from pathlib import Path

import openpyxl
from openpyxl.utils.datetime import from_excel


SOURCE = Path(r"D:\2026\JP\Padron 2026.xlsx")
OUTPUT = Path(r"D:\2026\JP\audit_work\audit_results.json")
SHEETS = ("C1", "C2", "C3", "C4")


def norm(value):
    text = str(value or "").strip().upper()
    return unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode("ascii")


DEPENDENCY_ALIASES = {
    "ICHDYCF": "ICHD",
    "SECRETARIA DE TURISMO": "TURISMO",
    "SDHYBC": "SDHyBC",
    "SPYCI": "SPyCI",
}

KNOWN_DEPENDENCIES = {
    "CECYTECH", "COESPO", "COESVI", "CULTURA", "DIF", "ICHD", "ICHDII",
    "ICHIJUV", "ICHIMUJ", "RURAL", "SALUD", "SDHYBC", "SEECH", "SEYD",
    "SPYCI", "TRABAJO", "TURISMO",
}

OFFICIAL_MUNICIPALITIES = {
    norm(x) for x in (
        "AHUMADA", "ALDAMA", "ALLENDE", "AQUILES SERDAN", "ASCENSION",
        "BACHINIVA", "BALLEZA", "BATOPILAS DE MANUEL GOMEZ MORIN", "BOCOYNA",
        "BUENAVENTURA", "CAMARGO", "CARICHI", "CASAS GRANDES", "CHIHUAHUA",
        "CHINIPAS", "CORONADO", "COYAME DEL SOTOL", "CUAUHTEMOC",
        "CUSIHUIRIACHI", "DELICIAS", "DR. BELISARIO DOMINGUEZ", "EL TULE",
        "GALEANA", "GOMEZ FARIAS", "GRAN MORELOS", "GUACHOCHI", "GUADALUPE",
        "GUADALUPE Y CALVO", "GUAZAPARES", "GUERRERO", "HIDALGO DEL PARRAL",
        "HUEJOTITAN", "IGNACIO ZARAGOZA", "JANOS", "JIMENEZ", "JUAREZ",
        "JULIMES", "LA CRUZ", "LOPEZ", "MADERA", "MAGUARICHI",
        "MANUEL BENAVIDES", "MATACHI", "MATAMOROS", "MEOQUI", "MORELOS",
        "MORIS", "NAMIQUIPA", "NONOAVA", "NUEVO CASAS GRANDES", "OCAMPO",
        "OJINAGA", "PRAXEDIS G. GUERRERO", "RIVA PALACIO", "ROSALES", "ROSARIO",
        "SAN FRANCISCO DE BORJA", "SAN FRANCISCO DE CONCHOS",
        "SAN FRANCISCO DEL ORO", "SANTA BARBARA", "SANTA ISABEL", "SATEVO",
        "SAUCILLO", "TEMOSACHIC", "URIQUE", "URUACHI", "VALLE DE ZARAGOZA",
    )
}

CURP_PATTERN = re.compile(r"^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$")

RULES = [
    ("dependencia", "Dependencia ausente o no reconocida"),
    ("programa", "Programa ausente"),
    ("nombre", "Nombre ausente"),
    ("apellido", "Primer apellido ausente"),
    ("curp", "CURP ausente o con formato inválido"),
    ("sexo", "Sexo distinto de H/M"),
    ("fecha_nacimiento", "Fecha de nacimiento ausente o inválida"),
    ("edad", "Edad ausente o fuera de 0 a 105"),
    ("municipio", "Municipio ausente o fuera del catálogo estatal"),
    ("cp", "Código postal inválido"),
    ("telefono", "Teléfono inválido"),
    ("mes", "Mes correspondiente ausente"),
]


def empty(value):
    if value is None:
        return True
    text = str(value).strip()
    return text == "" or text.lower() in {"none", "nan", "(en blanco)"}


def dependency_name(value):
    key = norm(value)
    if not key:
        return "SIN DEPENDENCIA"
    return DEPENDENCY_ALIASES.get(key, key)


def digits(value):
    if value is None or isinstance(value, bool):
        return ""
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        if math.isnan(value):
            return ""
        if value.is_integer():
            return str(int(value))
    return re.sub(r"\D", "", str(value))


def valid_date(value):
    parsed = None
    if isinstance(value, datetime):
        parsed = value.date()
    elif isinstance(value, date):
        parsed = value
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        try:
            parsed = from_excel(value).date()
        except Exception:
            parsed = None
    elif not empty(value):
        text = str(value).strip()
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%m/%d/%Y"):
            try:
                parsed = datetime.strptime(text, fmt).date()
                break
            except ValueError:
                continue
    return parsed is not None and date(1900, 1, 1) <= parsed <= date.today()


def valid_age(value):
    if value is None or isinstance(value, bool):
        return False
    try:
        number = float(str(value).strip().replace(",", "."))
    except Exception:
        return False
    return math.isfinite(number) and number.is_integer() and 0 <= number <= 105


def flags_for(row):
    dep_raw = row[0] if len(row) > 0 else None
    program = row[1] if len(row) > 1 else None
    name = row[2] if len(row) > 2 else None
    first_lastname = row[3] if len(row) > 3 else None
    curp = norm(row[5] if len(row) > 5 else None)
    sex = norm(row[6] if len(row) > 6 else None)
    birth = row[7] if len(row) > 7 else None
    age = row[8] if len(row) > 8 else None
    municipality = norm(row[17] if len(row) > 17 else None)
    postal_code = digits(row[18] if len(row) > 18 else None)
    phone = digits(row[19] if len(row) > 19 else None)
    month = row[20] if len(row) > 20 else None

    return {
        "dependencia": empty(dep_raw) or norm(dep_raw) not in KNOWN_DEPENDENCIES,
        "programa": empty(program),
        "nombre": empty(name),
        "apellido": empty(first_lastname),
        "curp": not bool(CURP_PATTERN.fullmatch(curp)),
        "sexo": sex not in {"H", "M"},
        "fecha_nacimiento": not valid_date(birth),
        "edad": not valid_age(age),
        "municipio": municipality not in OFFICIAL_MUNICIPALITIES,
        "cp": not (len(postal_code) == 5 and postal_code[:2] in {"31", "32", "33"}),
        "telefono": not (len(phone) == 10 and not phone.startswith("0")),
        "mes": empty(month),
    }


def new_stat():
    return {
        "total_records": 0,
        "inconsistent_records": 0,
        "total_inconsistencies": 0,
        "errors": {key: 0 for key, _ in RULES},
    }


workbook = openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)
stats = defaultdict(new_stat)
source_rows = {}

for sheet_name in SHEETS:
    worksheet = workbook[sheet_name]
    count = 0
    for row in worksheet.iter_rows(min_row=2, values_only=True):
        if not any(not empty(value) for value in row[:21]):
            continue
        count += 1
        dep = dependency_name(row[0] if row else None)
        record_flags = flags_for(row)
        error_count = sum(1 for value in record_flags.values() if value)

        stat = stats[dep]
        stat["total_records"] += 1
        stat["total_inconsistencies"] += error_count
        if error_count:
            stat["inconsistent_records"] += 1
        for key, has_error in record_flags.items():
            if has_error:
                stat["errors"][key] += 1
    source_rows[sheet_name] = count

rows = []
for dep, stat in stats.items():
    total = stat["total_records"]
    inconsistent = stat["inconsistent_records"]
    top_key = max(stat["errors"], key=stat["errors"].get)
    rows.append({
        "dependency": dep,
        **stat,
        "correct_records": total - inconsistent,
        "error_rate": inconsistent / total if total else 0,
        "average_errors_per_inconsistent": stat["total_inconsistencies"] / inconsistent if inconsistent else 0,
        "top_error_key": top_key,
        "top_error_label": dict(RULES)[top_key],
        "top_error_count": stat["errors"][top_key],
    })

rows.sort(key=lambda item: (-item["error_rate"], -item["total_records"], item["dependency"]))
global_total = sum(item["total_records"] for item in rows)
global_inconsistent = sum(item["inconsistent_records"] for item in rows)
global_inconsistencies = sum(item["total_inconsistencies"] for item in rows)

result = {
    "source": str(SOURCE),
    "generated_at": datetime.now().isoformat(timespec="seconds"),
    "scope": list(SHEETS),
    "source_rows": source_rows,
    "rules": [{"key": key, "label": label} for key, label in RULES],
    "dependencies": rows,
    "global": {
        "total_records": global_total,
        "inconsistent_records": global_inconsistent,
        "correct_records": global_total - global_inconsistent,
        "error_rate": global_inconsistent / global_total if global_total else 0,
        "total_inconsistencies": global_inconsistencies,
        "dependency_count": len(rows),
    },
}

OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({
    "output": str(OUTPUT),
    "source_rows": source_rows,
    "global": result["global"],
    "dependencies": [
        {
            "dependency": item["dependency"],
            "total": item["total_records"],
            "inconsistent": item["inconsistent_records"],
            "error_rate": round(item["error_rate"] * 100, 2),
            "top_error": item["top_error_label"],
        }
        for item in rows
    ],
}, ensure_ascii=False, indent=2))
