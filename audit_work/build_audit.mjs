import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = "D:/2026/JP/audit_work/audit_results.json";
const outputDir = "D:/2026/JP/outputs/auditoria_padron_20260825";
const outputPath = `${outputDir}/Auditoria_Padron_por_Dependencia.xlsx`;
const previewDir = `${outputDir}/previews`;

const data = JSON.parse(await fs.readFile(inputPath, "utf8"));
const deps = data.dependencies;
const rules = data.rules;
const firstRow = 10;
const lastRow = firstRow + deps.length - 1;

const wb = Workbook.create();
const summary = wb.worksheets.add("Resumen");
const causes = wb.worksheets.add("Errores por campo");
const method = wb.worksheets.add("Metodologia");

const C = {
  navy: "#0F172A",
  slate: "#334155",
  pale: "#F1F5F9",
  line: "#CBD5E1",
  white: "#FFFFFF",
  red: "#B91C1C",
  redPale: "#FEE2E2",
  green: "#15803D",
  greenPale: "#DCFCE7",
  teal: "#0F766E",
  amber: "#D97706",
};

function title(sheet, range, text) {
  sheet.getRange(range).merge();
  const anchor = range.split(":")[0];
  sheet.getRange(anchor).values = [[text]];
  sheet.getRange(range).format = {
    fill: C.navy,
    font: { bold: true, color: C.white, size: 18, name: "Aptos Display" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 34;
}

function subtitle(sheet, range, text) {
  sheet.getRange(range).merge();
  const anchor = range.split(":")[0];
  sheet.getRange(anchor).values = [[text]];
  sheet.getRange(range).format = {
    fill: C.pale,
    font: { color: C.slate, size: 10, name: "Aptos" },
    wrapText: true,
    verticalAlignment: "center",
  };
  sheet.getRange(range).format.rowHeight = 32;
}

function card(sheet, labelRange, valueRange, label, formula, fill, numberFormat) {
  sheet.getRange(labelRange).merge();
  sheet.getRange(valueRange).merge();
  const labelCell = labelRange.split(":")[0];
  const valueCell = valueRange.split(":")[0];
  sheet.getRange(labelCell).values = [[label]];
  sheet.getRange(valueCell).formulas = [[formula]];
  sheet.getRange(labelRange).format = {
    fill,
    font: { bold: true, color: C.white, size: 10, name: "Aptos" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
  };
  sheet.getRange(valueRange).format = {
    fill: C.white,
    font: { bold: true, color: fill, size: 20, name: "Aptos Display" },
    borders: { preset: "outside", style: "medium", color: fill },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    numberFormat,
  };
}

summary.showGridLines = false;
title(summary, "A1:H1", "Auditoría de calidad del Padrón 2026 por dependencia");
subtitle(
  summary,
  "A2:H2",
  "Una fila se clasifica como inconsistente cuando incumple al menos una de las 12 reglas documentadas. Las causas pueden superponerse, pero cada fila se cuenta una sola vez en el porcentaje principal.",
);

card(summary, "A4:B4", "A5:B6", "TOTAL DE REGISTROS", `=SUM(B${firstRow}:B${lastRow})`, C.slate, "#,##0");
card(summary, "C4:D4", "C5:D6", "REGISTROS INCONSISTENTES", `=SUM(C${firstRow}:C${lastRow})`, C.red, "#,##0");
card(summary, "E4:F4", "E5:F6", "% DE ERROR GLOBAL", "=IFERROR(C5/A5,0)", C.amber, "0.0%");
card(summary, "G4:H4", "G5:H6", "DEPENDENCIAS EVALUADAS", `=COUNTA(A${firstRow}:A${lastRow})`, C.teal, "#,##0");

summary.getRange("A8:H8").merge();
summary.getRange("A8").values = [["Resultados ordenados de mayor a menor porcentaje de error"]];
summary.getRange("A8:H8").format = {
  font: { italic: true, color: C.slate, size: 10, name: "Aptos" },
  verticalAlignment: "center",
};

const summaryHeaders = [[
  "Dependencia",
  "Total registros",
  "Registros inconsistentes",
  "Registros correctos",
  "% de error",
  "Total de inconsistencias",
  "Promedio errores por registro inconsistente",
  "Principal causa",
]];
summary.getRange("A9:H9").values = summaryHeaders;
summary.getRange(`A${firstRow}:H${lastRow}`).values = deps.map((d) => [
  d.dependency,
  d.total_records,
  d.inconsistent_records,
  null,
  null,
  d.total_inconsistencies,
  null,
  `${d.top_error_label} (${d.top_error_count.toLocaleString("es-MX")})`,
]);
summary.getRange(`D${firstRow}:D${lastRow}`).formulas = deps.map((_, index) => {
  const row = firstRow + index;
  return [`=B${row}-C${row}`];
});
summary.getRange(`E${firstRow}:E${lastRow}`).formulas = deps.map((_, index) => {
  const row = firstRow + index;
  return [`=IFERROR(C${row}/B${row},0)`];
});
summary.getRange(`G${firstRow}:G${lastRow}`).formulas = deps.map((_, index) => {
  const row = firstRow + index;
  return [`=IFERROR(F${row}/C${row},0)`];
});

const summaryTable = summary.tables.add(`A9:H${lastRow}`, true, "ResumenDependencias");
summaryTable.style = "TableStyleMedium2";
summary.getRange("A9:H9").format = {
  fill: C.navy,
  font: { bold: true, color: C.white, size: 10, name: "Aptos" },
  wrapText: true,
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
summary.getRange(`B${firstRow}:D${lastRow}`).format.numberFormat = "#,##0";
summary.getRange(`E${firstRow}:E${lastRow}`).format.numberFormat = "0.0%";
summary.getRange(`F${firstRow}:F${lastRow}`).format.numberFormat = "#,##0";
summary.getRange(`G${firstRow}:G${lastRow}`).format.numberFormat = "0.00";
summary.getRange(`A${firstRow}:H${lastRow}`).format.verticalAlignment = "center";
summary.getRange(`H${firstRow}:H${lastRow}`).format.wrapText = true;
summary.getRange(`E${firstRow}:E${lastRow}`).conditionalFormats.add("colorScale", {
  criteria: [
    { type: "lowestValue", color: "#DCFCE7" },
    { type: "percentile", value: 50, color: "#FEF3C7" },
    { type: "highestValue", color: "#FECACA" },
  ],
});
summary.freezePanes.freezeRows(9);

summary.getRange(`A1:A${lastRow}`).format.columnWidth = 18;
summary.getRange(`B1:F${lastRow}`).format.columnWidth = 16;
summary.getRange(`G1:G${lastRow}`).format.columnWidth = 21;
summary.getRange(`H1:H${lastRow}`).format.columnWidth = 40;
summary.getRange("A9:H9").format.rowHeight = 34;

const chart = summary.charts.add("bar", {
  chartType: "bar",
  title: "% de error por dependencia",
  hasLegend: false,
});
const series = chart.series.add("% de error");
series.categoryFormula = `'Resumen'!$A$${firstRow}:$A$${lastRow}`;
series.formula = `'Resumen'!$E$${firstRow}:$E$${lastRow}`;
series.fill = C.red;
chart.title = "% de error por dependencia";
chart.hasLegend = false;
chart.yAxis = { numberFormatCode: "0%" };
chart.setPosition("J3", "R30");

causes.showGridLines = false;
title(causes, "A1:E1", "Desglose de inconsistencias por campo");
subtitle(
  causes,
  "A2:E2",
  "Un mismo registro puede aparecer en varias causas. Por ello, la suma de causas puede ser mayor que los registros inconsistentes de la hoja Resumen.",
);
causes.getRange("A4:E4").values = [["Dependencia", "Tipo de inconsistencia", "Total registros", "Registros con esta inconsistencia", "% de registros de la dependencia"]];

const causeRows = [];
for (const dep of deps) {
  for (const rule of rules) {
    causeRows.push([
      dep.dependency,
      rule.label,
      dep.total_records,
      dep.errors[rule.key],
      null,
    ]);
  }
}
const causeFirst = 5;
const causeLast = causeFirst + causeRows.length - 1;
causes.getRange(`A${causeFirst}:E${causeLast}`).values = causeRows;
causes.getRange(`E${causeFirst}:E${causeLast}`).formulas = causeRows.map((_, index) => {
  const row = causeFirst + index;
  return [`=IFERROR(D${row}/C${row},0)`];
});
const causesTable = causes.tables.add(`A4:E${causeLast}`, true, "DetalleCausas");
causesTable.style = "TableStyleMedium2";
causes.getRange("A4:E4").format = {
  fill: C.navy,
  font: { bold: true, color: C.white, size: 10, name: "Aptos" },
  wrapText: true,
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
causes.getRange(`C${causeFirst}:D${causeLast}`).format.numberFormat = "#,##0";
causes.getRange(`E${causeFirst}:E${causeLast}`).format.numberFormat = "0.0%";
causes.getRange(`E${causeFirst}:E${causeLast}`).conditionalFormats.add("colorScale", {
  criteria: [
    { type: "lowestValue", color: "#FFFFFF" },
    { type: "percentile", value: 50, color: "#FEF3C7" },
    { type: "highestValue", color: "#FECACA" },
  ],
});
causes.getRange(`A1:A${causeLast}`).format.columnWidth = 18;
causes.getRange(`B1:B${causeLast}`).format.columnWidth = 42;
causes.getRange(`C1:E${causeLast}`).format.columnWidth = 22;
causes.getRange("A4:E4").format.rowHeight = 34;
causes.freezePanes.freezeRows(4);

method.showGridLines = false;
title(method, "A1:F1", "Metodología y control de la auditoría");
subtitle(method, "A2:F2", "Fuente: Padrón 2026.xlsx. Alcance: todas las filas con información de C1, C2, C3 y C4.");

method.getRange("A4:B10").values = [
  ["Elemento", "Definición"],
  ["Fuente", data.source],
  ["Fecha de generación", data.generated_at],
  ["Unidad evaluada", "Registro o fila del padrón"],
  ["Registro inconsistente", "Fila que incumple una o más reglas de calidad"],
  ["% de error", "Registros inconsistentes / total de registros de la dependencia"],
  ["Importante", "Cada fila cuenta una sola vez en el % de error; las causas sí pueden superponerse"],
];
method.getRange("A4:B4").format = {
  fill: C.navy,
  font: { bold: true, color: C.white, name: "Aptos" },
};
method.getRange("A5:A10").format.font = { bold: true, color: C.slate, name: "Aptos" };
method.getRange("B5:B10").format.wrapText = true;
method.getRange("A4:B10").format.borders = { preset: "outside", style: "thin", color: C.line };

method.getRange("D4:F4").values = [["Hoja fuente", "Registros auditados", "Control"]];
const sourceEntries = Object.entries(data.source_rows);
method.getRange(`D5:E${4 + sourceEntries.length}`).values = sourceEntries.map(([sheet, count]) => [sheet, count]);
const totalControlRow = 5 + sourceEntries.length;
method.getRange(`D${totalControlRow}:F${totalControlRow}`).values = [["TOTAL", null, null]];
method.getRange(`E${totalControlRow}`).formulas = [[`=SUM(E5:E${totalControlRow - 1})`]];
method.getRange(`F${totalControlRow}`).formulas = [[`=IF(E${totalControlRow}='Resumen'!A5,"OK","REVISAR")`]];
method.getRange("D4:F4").format = {
  fill: C.navy,
  font: { bold: true, color: C.white, name: "Aptos" },
  horizontalAlignment: "center",
};
method.getRange(`D${totalControlRow}:F${totalControlRow}`).format = {
  fill: C.pale,
  font: { bold: true, color: C.slate, name: "Aptos" },
  borders: { preset: "doubleBottom", style: "medium", color: C.slate },
};
method.getRange(`E5:E${totalControlRow}`).format.numberFormat = "#,##0";

method.getRange("A13:C13").values = [["Regla", "Se marca inconsistencia cuando", "Tipo"]];
const ruleDescriptions = {
  dependencia: "La dependencia está vacía o no pertenece al catálogo reconocido; se normalizan ICHDyCF→ICHD y Secretaría de Turismo→TURISMO.",
  programa: "El programa está vacío.",
  nombre: "El nombre está vacío.",
  apellido: "El primer apellido está vacío.",
  curp: "La CURP no cumple el patrón de 18 caracteres AAAA999999HAAAAA99.",
  sexo: "El valor no es H ni M.",
  fecha_nacimiento: "La fecha está vacía, no se puede interpretar o queda fuera de 1900 a la fecha actual.",
  edad: "La edad está vacía, no es un número entero o está fuera de 0 a 105.",
  municipio: "El municipio está vacío o no coincide con el catálogo oficial de 67 municipios de Chihuahua.",
  cp: "Después de conservar solo dígitos, el CP no tiene 5 dígitos o no inicia con 31, 32 o 33.",
  telefono: "Después de conservar solo dígitos, el teléfono no tiene 10 dígitos o inicia con cero.",
  mes: "El mes correspondiente está vacío.",
};
method.getRange(`A14:C${13 + rules.length}`).values = rules.map((rule, index) => [
  index + 1,
  ruleDescriptions[rule.key],
  rule.label,
]);
method.getRange("A13:C13").format = {
  fill: C.navy,
  font: { bold: true, color: C.white, name: "Aptos" },
  horizontalAlignment: "center",
};
method.getRange(`A14:C${13 + rules.length}`).format.wrapText = true;
method.getRange(`A13:C${13 + rules.length}`).format.borders = { preset: "outside", style: "thin", color: C.line };
method.getRange(`A1:A${13 + rules.length}`).format.columnWidth = 16;
method.getRange(`B1:B${13 + rules.length}`).format.columnWidth = 70;
method.getRange(`C1:C${13 + rules.length}`).format.columnWidth = 38;
method.getRange(`D1:F${totalControlRow}`).format.columnWidth = 19;
method.freezePanes.freezeRows(3);

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const summaryCheck = await wb.inspect({
  kind: "table",
  sheetId: "Resumen",
  range: `A4:H${lastRow}`,
  include: "values,formulas",
  tableMaxRows: 30,
  tableMaxCols: 10,
  maxChars: 14000,
});
console.log("=== RESUMEN CHECK ===");
console.log(summaryCheck.ndjson);

const errors = await wb.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
  maxChars: 8000,
});
console.log("=== ERROR SCAN ===");
console.log(errors.ndjson);

for (const [sheetName, range] of [
  ["Resumen", `A1:R30`],
  ["Errores por campo", "A1:E35"],
  ["Metodologia", `A1:F${13 + rules.length}`],
]) {
  const preview = await wb.render({ sheetName, range, scale: 1.5, format: "png" });
  const safeName = sheetName.replaceAll(" ", "_");
  await fs.writeFile(`${previewDir}/${safeName}.png`, new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputPath);
console.log(JSON.stringify({ outputPath, previewDir, rows: deps.length, causeRows: causeRows.length }, null, 2));
