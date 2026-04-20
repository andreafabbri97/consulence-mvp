@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Simple launcher: starts backend (venv) and frontend (npm) in separate windows
set ROOT=%~dp0

echo ==============================================
echo  Start development servers — Advisor MVP
echo ==============================================

REM --- Backend venv check ---
if not exist "%ROOT%backend\.venv\Scripts\activate.bat" (
  echo [INFO] virtualenv non trovato per backend. Creo e installo dipendenze...
  pushd "%ROOT%backend"
  python -m venv .venv
  call .venv\Scripts\activate.bat
  pip install -r requirements.txt
  popd
)

REM --- Frontend deps check ---
if not exist "%ROOT%frontend\node_modules" (
  echo [INFO] node_modules non trovato per frontend. Eseguo npm install...
  pushd "%ROOT%frontend"
  if exist "%ProgramFiles%\nodejs\npm.cmd" (
    call "%ProgramFiles%\nodejs\npm.cmd" install
  ) else (
    npm install
  )
  popd
)

REM --- Start backend ---
pushd "%ROOT%backend"
start "Advisor Backend" cmd /k "call .venv\Scripts\activate.bat && echo Starting backend on http://localhost:8000 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
popd

REM --- Start frontend ---
pushd "%ROOT%frontend"
if exist "%ProgramFiles%\nodejs\npm.cmd" (
  start "Advisor Frontend" cmd /k "call \"%ProgramFiles%\nodejs\npm.cmd\" run dev"
) else (
  start "Advisor Frontend" cmd /k "npm run dev"
)
popd

REM --- Show access URLs ---
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R /C:"IPv4"') do (
  for /f "tokens=* delims= " %%B in ("%%A") do set LOCAL_IP=%%B
  goto :got_local_ip
)
:got_local_ip
if "%LOCAL_IP%"=="" (
  REM fallback to localhost if we couldn't detect an IP
  set LOCAL_IP=localhost
)
echo Development servers started.
echo Backend:  http://localhost:8000  (LAN: http://%LOCAL_IP%:8000)
echo Frontend: http://localhost:3000  (LAN: http://%LOCAL_IP%:3000 — se Next.js usa un'altra porta, verifica la console)
echo.
echo Press any key to close this launcher window.
pause >nul
