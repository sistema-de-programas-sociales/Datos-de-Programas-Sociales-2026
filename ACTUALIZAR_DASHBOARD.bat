@echo off
chcp 65001 >nul
title Actualizar Dashboard - SDHyBC 2026

echo.
echo  Actualizando Dashboard SDHyBC 2026...
echo.

:: Buscar Excel en la carpeta (prioriza Reporte/Informe)
set "EXCEL="
for %%f in ("%~dp0*Reporte*.xlsx" "%~dp0*Informe*.xlsx") do (
    if exist "%%f" if not defined EXCEL set "EXCEL=%%f"
)
if not defined EXCEL (
    for %%f in ("%~dp0*.xlsx") do (
        if not "%%~nxf"=="~$%%~nxf" if not defined EXCEL set "EXCEL=%%f"
    )
)
if not defined EXCEL (
    echo  ERROR: No se encontro ningun archivo .xlsx en esta carpeta.
    pause & exit /b 1
)
echo  Excel: %EXCEL%
echo.

:: PASO 1: data_dashboard.js
echo  [1/2] Generando data_dashboard.js...
node "%~dp0GENERAR_REPORTE.js" --web
if errorlevel 1 (
    echo  ERROR en GENERAR_REPORTE.js
    pause & exit /b 1
)

:: PASO 2: js_render_nutri.js
echo.
echo  [2/2] Actualizando NutriChihuahua...
python3 "%~dp0generar_nutrichihuahua.py" "%EXCEL%" --dashboard-only
if errorlevel 1 (
    echo  ERROR en generar_nutrichihuahua.py
    pause & exit /b 1
)

echo.
echo  Dashboard actualizado correctamente.
echo.
pause
