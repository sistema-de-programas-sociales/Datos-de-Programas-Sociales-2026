@echo off
chcp 65001 >nul
title Generador de Reporte Quincenal - Chihuahua

echo.
echo  Generador de Reporte Quincenal SDHyBC 2026
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
echo  Excel detectado: %EXCEL%
echo.

:: Generar reporte principal
echo  Generando reporte...
node "%~dp0GENERAR_REPORTE.js" %*
if errorlevel 1 (
    echo  ERROR en GENERAR_REPORTE.js
    pause & exit /b 1
)

:: Si se uso --web, actualizar NutriChihuahua tambien
echo %* | findstr /i "\-\-web" >nul
if not errorlevel 1 (
    echo.
    echo  Actualizando NutriChihuahua...
    python3 "%~dp0generar_nutrichihuahua.py" "%EXCEL%" --dashboard-only
    if errorlevel 1 (
        echo  ERROR en generar_nutrichihuahua.py
        pause & exit /b 1
    )
)

echo.
pause
