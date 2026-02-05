@echo off
title Vertebra 2.0 Launcher
echo ==========================================
echo    Iniciando Vertebra 2.0 (Local App)
echo ==========================================
echo.
echo 1. Arrancando el servidor...
echo 2. Por favor, NO cierres esta ventana negra mientras uses la App.
echo 3. Abriendo la aplicacion en tu navegador...
echo.

cd /d "%~dp0"
start "" http://localhost:3000
npm start
