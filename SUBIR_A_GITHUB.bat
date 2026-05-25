@echo off
cd /d D:\2026\JP

echo.
echo ================================
echo   SUBIR ECOSISTEMA A GITHUB
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
if "%MSG%"=="" set MSG=Actualizar

echo.
echo Sincronizando con GitHub...
git pull --rebase origin main
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR al sincronizar. Puede haber conflictos que resolver manualmente.
    pause
    exit /b 1
)

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