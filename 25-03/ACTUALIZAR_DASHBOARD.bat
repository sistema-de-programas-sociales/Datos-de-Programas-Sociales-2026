@echo off
chcp 65001 >nul
title Actualizar Dashboard — SDHyBC 2026
echo.
echo  Actualizando dashboard...
echo.
node "%~dp0GENERAR_REPORTE.js" --web
