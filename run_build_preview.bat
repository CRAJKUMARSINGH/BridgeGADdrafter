@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo Checking Node.js...
node --version >NUL 2>&1
IF ERRORLEVEL 1 (
  echo Node.js is not installed. Please install from https://nodejs.org and re-run.
  pause
  exit /b 1
)

echo Installing dependencies (this may take a few minutes)...
npm install --no-audit --no-fund
IF ERRORLEVEL 1 (
  echo npm install failed. Please check your internet connection and try again.
  pause
  exit /b 1
)

echo Building the app...
npm run build
IF ERRORLEVEL 1 (
  echo Build failed. Please review errors above.
  pause
  exit /b 1
)

echo Starting server in production mode...
npm start

ENDLOCAL
