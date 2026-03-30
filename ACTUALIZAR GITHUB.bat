@echo off
cd /d D:\2026\JP\Dashboard

echo.
echo ================================
echo   SUBIR DASHBOARD A GITHUB
echo ================================
echo.

if not exist ".git" (
    echo ERROR: Esta carpeta no esta conectada a Git.
    pause
    exit /b 1
)

echo Archivos modificados:
echo --------------------------------
git status --short
echo.

set /p MSG="Describe los cambios: "
if "%MSG%"=="" set MSG=Actualizar dashboard

echo.
echo Subiendo a GitHub...

git add .
git commit -m "%MSG%"
git push origin main

echo.
if %ERRORLEVEL%==0 (
    echo LISTO - Cambios subidos correctamente
) else (
    echo ERROR al subir. Revisa tu conexion.
)

echo.
pause
