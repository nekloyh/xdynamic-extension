#!/bin/bash

# Quick start script for the current XDynamic project
# Focus: Chrome extension (frontend/extension). Backend setup is optional.

set -e

EXT_DIR="frontend/extension"
BACKEND_DIR="backend"
VENV_DIR=".venv"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

header() {
  echo -e "${GREEN}========================================${NC}"
  echo -e "${GREEN}XDynamic - Quick Start${NC}"
  echo -e "${GREEN}========================================${NC}"
  echo ""
}

fail() {
  echo -e "${RED}$1${NC}"
  exit 1
}

require_dir() {
  if [ ! -d "$1" ]; then
    fail "Missing $1. Please run this script from the repo root."
  fi
}

cmd_exists() { command -v "$1" >/dev/null 2>&1; }

ensure_node() {
  if ! cmd_exists node; then
    fail "Node.js is required (install Node 18+)."
  fi
  if ! cmd_exists npm; then
    fail "npm is required and must be on PATH."
  fi
}

ensure_python() {
  if ! cmd_exists python3 && ! cmd_exists python; then
    fail "Python 3 is required for backend tasks."
  fi
}

ensure_extension_env() {
  if [ ! -f ".env" ]; then
    cat > .env <<'EOL'
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_ENV=development
EOL
    echo -e "${YELLOW}Created ${EXT_DIR}/.env (please adjust values).${NC}"
  fi
}

setup_extension() {
  echo -e "${YELLOW}Setting up extension...${NC}"
  cd "$EXT_DIR"
  npm install
  ensure_extension_env
  echo -e "${GREEN}Extension dependencies installed.${NC}"
  echo -e "Run dev server: ${YELLOW}npm run dev${NC}"
  echo -e "Build bundle:   ${YELLOW}npm run build${NC}"
}

run_extension_dev() {
  echo -e "${YELLOW}Starting extension dev server...${NC}"
  cd "$EXT_DIR"
  [ -d node_modules ] || npm install
  npm run dev
}

build_extension() {
  echo -e "${YELLOW}Building extension...${NC}"
  cd "$EXT_DIR"
  [ -d node_modules ] || npm install
  npm run build
  echo -e "${GREEN}Build complete.${NC}"
  echo -e "Load in Chrome: chrome://extensions -> Load unpacked -> select dist/"
}

lint_extension() {
  echo -e "${YELLOW}Linting and type-checking...${NC}"
  cd "$EXT_DIR"
  [ -d node_modules ] || npm install
  npm run lint
  npm run type-check
  echo -e "${GREEN}Lint/type-check done.${NC}"
}

setup_backend() {
  ensure_python
  echo -e "${YELLOW}Setting up backend...${NC}"
  cd "$BACKEND_DIR"
  if [ ! -d "$VENV_DIR" ]; then
    python -m venv "$VENV_DIR"
  fi
  # shellcheck disable=SC1090
  source "$VENV_DIR/bin/activate" 2>/dev/null || source "$VENV_DIR/Scripts/activate"
  pip install -r requirements.txt
  mkdir -p data
  if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}Created backend .env from template. Update credentials as needed.${NC}"
  fi
  echo -e "${GREEN}Backend ready.${NC}"
}

run_backend() {
  ensure_python
  echo -e "${YELLOW}Starting backend (http://localhost:8000)...${NC}"
  cd "$BACKEND_DIR"
  if [ ! -d "$VENV_DIR" ]; then
    setup_backend
  else
    # shellcheck disable=SC1090
    source "$VENV_DIR/bin/activate" 2>/dev/null || source "$VENV_DIR/Scripts/activate"
  fi
  python run.py
}

main() {
  header
  require_dir "$EXT_DIR"
  ensure_node

  echo "Chon thao tac:"
  echo "1) Cai dat extension"
  echo "2) Chay dev server extension"
  echo "3) Build extension"
  echo "4) Lint + type-check extension"
  echo "5) Cai dat backend (tuy chon)"
  echo "6) Chay backend (tuy chon)"
  echo ""
  read -r -p "Nhap lua chon (1-6): " choice

  case "$choice" in
    1) setup_extension ;;
    2) run_extension_dev ;;
    3) build_extension ;;
    4) lint_extension ;;
    5) require_dir "$BACKEND_DIR"; setup_backend ;;
    6) require_dir "$BACKEND_DIR"; run_backend ;;
    *) fail "Lua chon khong hop le" ;;
  esac
}

main "$@"
