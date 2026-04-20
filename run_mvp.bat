@echo off
setlocal ENABLEDELAYEDEXPANSION

set ROOT=%~dp0

set "NODE_EXE="
for %%D in ("%ProgramFiles%\nodejs\node.exe" "%ProgramFiles(x86)%\nodejs\node.exe" "%USERPROFILE%\AppData\Local\Programs\nodejs\node.exe") do (
    if not defined NODE_EXE if exist %%~D set "NODE_EXE=%%~fD"
)
if not defined NODE_EXE (
    echo [ERRORE] Node.js non trovato. Installa Node 18+ e assicurati che node.exe sia in Program Files o Apps locali.
    pause
    exit /b 1
)

echo ==============================================
echo  Avvio Advisor SaaS MVP
echo  Backend: http://localhost:8000
echo  Frontend: http://localhost:3000
echo ==============================================

if not exist "%ROOT%backend\.venv\Scripts\activate.bat" (
    echo [ERRORE] Virtualenv backend non trovato. Esegui prima: python -m venv backend\.venv && backend\.venv\Scripts\activate && pip install -r backend\requirements.txt
    pause
    exit /b 1
)

pushd "%ROOT%backend"
start "Advisor Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --reload"
popd

pushd "%ROOT%frontend"
if not exist node_modules (
    echo [INFO] node_modules mancante: esegui `npm install` in frontend/. prima di usare questo launcher.
)
start "Advisor Frontend" cmd /k ""\"%NODE_EXE%\" node_modules\next\dist\bin\next dev""
popd

echo Processi avviati in due finestre dedicate. Premi un tasto per chiudere il launcher...
pause >nul
