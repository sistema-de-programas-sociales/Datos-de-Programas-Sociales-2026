@echo off
chcp 65001 >nul
title Generador de Reporte Quincenal — Chihuahua
echo.
echo  Iniciando generador de reporte...
echo.
node "%~dp0GENERAR_REPORTE.js" %*
