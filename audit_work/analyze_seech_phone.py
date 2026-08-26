import math
import re
from collections import Counter

import openpyxl


SOURCE = r"D:\2026\JP\Padron 2026.xlsx"
SHEETS = ("C1", "C2", "C3", "C4")


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


book = openpyxl.load_workbook(SOURCE, read_only=True, data_only=True)
by_sheet = Counter()
by_length = Counter()
by_reason = Counter()
examples = Counter()

for sheet_name in SHEETS:
    sheet = book[sheet_name]
    for row in sheet.iter_rows(min_row=2, min_col=1, max_col=20, values_only=True):
        dependency = str(row[0] or "").strip().upper()
        if dependency != "SEECH":
            continue
        by_sheet[sheet_name] += 1
        raw_phone = row[19]
        phone = digits(raw_phone)
        by_length[len(phone)] += 1
        if not phone:
            reason = "vacio"
        elif len(phone) != 10:
            reason = f"longitud_{len(phone)}"
        elif phone.startswith("0"):
            reason = "inicia_con_0"
        else:
            reason = "valido"
        by_reason[reason] += 1
        if len(examples) < 30 or str(raw_phone) in examples:
            examples[str(raw_phone)] += 1

print("POR_HOJA", dict(by_sheet))
print("POR_RAZON", dict(by_reason))
print("POR_LONGITUD", dict(sorted(by_length.items())))
print("EJEMPLOS", examples.most_common(20))
