@echo off
cd /d "%~dp0"
where python >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8080
  python -m http.server 8080
) else (
  echo Python was not found. Install Python or open index.html directly.
  pause
)
