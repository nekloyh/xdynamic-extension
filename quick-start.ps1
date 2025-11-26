# Quick start script for the current XDynamic project (PowerShell)
# Focus: Chrome extension (frontend/extension). Backend setup is optional.

$ErrorActionPreference = "Stop"

$EXT_DIR = "frontend/extension"
$BACKEND_DIR = "backend"
$VENV_DIR = ".venv"

function Header {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "XDynamic - Quick Start" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
}

function Fail($msg) {
    Write-Host $msg -ForegroundColor Red
    exit 1
}

function Require-Dir($path) {
    if (-not (Test-Path $path)) {
        Fail "Missing $path. Please run this script from the repo root."
    }
}

function Ensure-Node {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Fail "Node.js is required (install Node 18+)."
    }
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Fail "npm is required and must be on PATH."
    }
}

function Ensure-Python {
    if (-not (Get-Command python -ErrorAction SilentlyContinue) -and -not (Get-Command python3 -ErrorAction SilentlyContinue)) {
        Fail "Python 3 is required for backend tasks."
    }
}

function Ensure-Extension-Env {
    if (-not (Test-Path ".env")) {
        @"
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "Created $EXT_DIR/.env (please adjust values)." -ForegroundColor Yellow
    }
}

function Setup-Extension {
    Write-Host "Setting up extension..." -ForegroundColor Yellow
    Set-Location $EXT_DIR
    npm install
    Ensure-Extension-Env
    Write-Host "Extension dependencies installed." -ForegroundColor Green
    Write-Host "Run dev server: npm run dev" -ForegroundColor Yellow
    Write-Host "Build bundle:   npm run build" -ForegroundColor Yellow
}

function Run-Extension-Dev {
    Write-Host "Starting extension dev server..." -ForegroundColor Yellow
    Set-Location $EXT_DIR
    if (-not (Test-Path "node_modules")) { npm install }
    npm run dev
}

function Build-Extension {
    Write-Host "Building extension..." -ForegroundColor Yellow
    Set-Location $EXT_DIR
    if (-not (Test-Path "node_modules")) { npm install }
    npm run build
    Write-Host "Build complete." -ForegroundColor Green
    Write-Host "Load in Chrome: chrome://extensions -> Load unpacked -> select dist/"
}

function Lint-Extension {
    Write-Host "Linting and type-checking..." -ForegroundColor Yellow
    Set-Location $EXT_DIR
    if (-not (Test-Path "node_modules")) { npm install }
    npm run lint
    npm run type-check
    Write-Host "Lint/type-check done." -ForegroundColor Green
}

function Setup-Backend {
    Ensure-Python
    Write-Host "Setting up backend..." -ForegroundColor Yellow
    Set-Location $BACKEND_DIR
    if (-not (Test-Path $VENV_DIR)) {
        python -m venv $VENV_DIR
    }
    & "$VENV_DIR\Scripts\Activate.ps1"
    pip install -r requirements.txt
    if (-not (Test-Path "data")) { New-Item -ItemType Directory -Path "data" | Out-Null }
    if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
        Copy-Item ".env.example" ".env"
        Write-Host "Created backend .env from template. Update credentials as needed." -ForegroundColor Yellow
    }
    Write-Host "Backend ready." -ForegroundColor Green
}

function Run-Backend {
    Ensure-Python
    Write-Host "Starting backend (http://localhost:8000)..." -ForegroundColor Yellow
    Set-Location $BACKEND_DIR
    if (-not (Test-Path $VENV_DIR)) {
        Setup-Backend
    } else {
        & "$VENV_DIR\Scripts\Activate.ps1"
    }
    python run.py
}

Header
Require-Dir $EXT_DIR
Ensure-Node

Write-Host "Chon thao tac:"
Write-Host "1) Cai dat extension"
Write-Host "2) Chay dev server extension"
Write-Host "3) Build extension"
Write-Host "4) Lint + type-check extension"
Write-Host "5) Cai dat backend (tuy chon)"
Write-Host "6) Chay backend (tuy chon)"
Write-Host ""
$choice = Read-Host "Nhap lua chon (1-6)"

switch ($choice) {
    "1" { Setup-Extension }
    "2" { Run-Extension-Dev }
    "3" { Build-Extension }
    "4" { Lint-Extension }
    "5" { Require-Dir $BACKEND_DIR; Setup-Backend }
    "6" { Require-Dir $BACKEND_DIR; Run-Backend }
    default { Fail "Lua chon khong hop le" }
}
