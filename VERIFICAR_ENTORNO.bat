@echo off
if "%~1"=="" ( cmd /k "%~f0" EJECUTANDO & exit /b )
setlocal enabledelayedexpansion

echo ============================================================
echo   VERIFICACION DE ENTORNO - Sistema de Programas Sociales
echo ============================================================
echo.

set ERRORES=0

echo [1/6] Verificando Python...
python3 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] Python NO encontrado
    echo       Descarga: https://www.python.org/downloads/
    echo       IMPORTANTE: marca "Add Python to PATH" al instalar
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%v in ('python3 --version 2^>^&1') do echo   [OK] %%v
)

echo.
echo [2/6] Verificando pip...
python3 -m pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] pip NO encontrado
    echo       Ejecuta: python3 -m ensurepip --upgrade
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%v in ('python3 -m pip --version 2^>^&1') do echo   [OK] %%v
)

echo.
echo [3/6] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] Node.js NO encontrado
    echo       Descarga: https://nodejs.org  ^(version LTS^)
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo   [OK] Node.js %%v
)

echo.
echo [4/6] Verificando npm...
node -e "const {execSync}=require('child_process');try{console.log('[OK] npm v'+execSync('npm --version').toString().trim())}catch(e){process.exit(1)}" 2>nul
if %errorlevel% neq 0 (
    echo   [X] npm NO encontrado ^(normalmente viene con Node.js^)
    set /a ERRORES+=1
)

echo.
echo [5/6] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] Git NO encontrado
    echo       Descarga: https://git-scm.com/download/win
    set /a ERRORES+=1
) else (
    for /f "tokens=*" %%v in ('git --version 2^>^&1') do echo   [OK] %%v
)

echo.
echo [6/6] Verificando librerias Python...
for %%L in (openpyxl pandas docx) do (
    python3 -c "import %%L" >nul 2>&1
    if !errorlevel! neq 0 (
        echo   [X] %%L NO instalada
        if "%%L"=="docx" (
            echo       Ejecuta: python3 -m pip install python-docx
        ) else (
            echo       Ejecuta: python3 -m pip install %%L
        )
        set /a ERRORES+=1
    ) else (
        echo   [OK] %%L
    )
)

echo.
echo ============================================================
if %ERRORES% equ 0 (
    echo   ENTORNO LISTO - Todo esta correctamente instalado.
    echo   Puedes ejecutar ACTUALIZAR_DASHBOARD.bat sin problemas.
) else (
    echo   SE ENCONTRARON %ERRORES% PROBLEMA^(S^).
    echo   Instala lo que falta segun las instrucciones de arriba,
    echo   luego vuelve a ejecutar este script para verificar.
    echo.
    echo   Nota: usa "python3 -m pip install ..." en lugar de "pip install ..."
)
echo ============================================================
echo.
pause
