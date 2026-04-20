@echo off
setlocal ENABLEDELAYEDEXPANSION

set ROOT=%~dp0

REM Verifica venv backend
if not exist "%ROOT%backend\.venv\Scripts\activate.bat" (
  echo [ERRORE] Virtualenv backend non trovato. Crea prima: python -m venv backend\.venv && pip install -r backend\requirements.txt
  pause
  exit /b 1
)

REM Apri firewall (richiede permessi amministratore se non già presenti)
powershell -Command "if (-not (Get-NetFirewallRule -DisplayName 'MVP Frontend 3001' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'MVP Frontend 3001' -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow }"
powershell -Command "if (-not (Get-NetFirewallRule -DisplayName 'MVP Backend 8000' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'MVP Backend 8000' -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow }"

REM Avvia backend (0.0.0.0:8000)
pushd "%ROOT%backend"
start "Advisor Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
popd

REM Avvia frontend (Next dev su 0.0.0.0:3001)
pushd "%ROOT%frontend"
set "NODE_EXE="
for %%D in ("%ProgramFiles%\nodejs\node.exe" "%ProgramFiles(x86)%\nodejs\node.exe" "%USERPROFILE%\AppData\Local\Programs\nodejs\node.exe") do (
  if not defined NODE_EXE if exist %%~D set "NODE_EXE=%%~fD"
)
if not defined NODE_EXE (
  echo [ERRORE] node.exe non trovato nel sistema. Esegui prima `npm install` e assicurati di avere Node.js.
  pause
  exit /b 1
)
start "Advisor Frontend" cmd /k "\"%NODE_EXE%\" node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 3001"
popd

echo ---------------------------------------------
echo Backend: http://%COMPUTERNAME%:8000  (usa il tuo IP LAN, es. http://192.168.1.100:8000)
echo Frontend: http://%COMPUTERNAME%:3001 (usa il tuo IP LAN, es. http://192.168.1.100:3001)
echo ---------------------------------------------
echo Launcher avviato; chiudi questa finestra per non interrompere i server.
pause >nul
