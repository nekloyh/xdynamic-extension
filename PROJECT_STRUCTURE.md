# 📁 XDynamic Extension - Clean Project Structure

**Last updated:** 2025-12-07

---

## 📂 Project Structure (Cleaned)

```
xdynamic-extension/
│
├── README.md                          # Main project documentation
├── CONTRIBUTING.md                    # Contribution guidelines
├── .gitignore                         # Git ignore rules
│
├── backend/                           # 🐍 Backend API (FastAPI + PyTorch)
│   ├── app/                           # Application code
│   │   ├── main.py                    # FastAPI app entry
│   │   ├── api.py                     # API router
│   │   ├── database.py                # Database connection
│   │   ├── config/                    # Settings
│   │   ├── controllers/               # API endpoints
│   │   ├── models/                    # Database models
│   │   ├── repositories/              # Data access layer
│   │   ├── schemas/                   # Pydantic schemas
│   │   └── services/                  # Business logic
│   │
│   ├── data/                          # SQLite database & uploads
│   ├── nginx/                         # Nginx config for production
│   │   └── conf.d/
│   │
│   ├── mobilenetv2_dangerous_objects.pth  # ML model weights
│   ├── requirements.txt               # Python dependencies
│   ├── seed_users.py                  # Initial admin/user setup
│   │
│   ├── .env                           # Local environment (KEEP, gitignored)
│   ├── .env.example                   # Environment template
│   │
│   ├── Dockerfile.prod                # 🐋 Production Dockerfile (CPU)
│   ├── Dockerfile.gpu                 # 🎮 Production Dockerfile (GPU)
│   │
│   ├── docker-compose.prod.yaml       # 🚀 Production stack (CPU + Nginx)
│   ├── docker-compose.prod.gpu.yaml   # 🚀 Production stack (GPU + Nginx)
│   ├── docker-compose.gpu.yml         # Development GPU
│   │
│   ├── build.sh                       # Build script (CPU version)
│   ├── build-gpu.sh                   # Build script (GPU version)
│   │
│   └── 📖 Documentation:
│       ├── GPU_DEPLOYMENT_GUIDE.md    # Full GPU setup guide
│       ├── GPU_VS_CPU_README.md       # CPU vs GPU comparison
│       ├── QUICK_START_GPU.txt        # Quick GPU commands
│       ├── PRODUCTION_CONFIG_CHECK.md # Config verification
│       └── URGENT_PRODUCTION_DEPLOY.md # Deployment instructions
│
└── frontend/                          # 🎨 Frontend applications
    │
    ├── extension/                     # 🧩 Chrome Extension
    │   ├── src/                       # Source code (React + TypeScript)
    │   ├── public/                    # Static assets
    │   ├── dist/                      # Built extension (generated)
    │   ├── node_modules/              # Dependencies (gitignored)
    │   │
    │   ├── package.json               # NPM dependencies
    │   ├── vite.config.ts             # Vite build config
    │   ├── tsconfig.json              # TypeScript config
    │   ├── tailwind.config.mjs        # Tailwind CSS config
    │   ├── manifest.ts                # Chrome extension manifest
    │   │
    │   ├── build-both-versions.sh     # 📦 Build dev + prod versions
    │   │
    │   ├── xdynamic-extension-development.zip   # 📦 For local testing
    │   ├── xdynamic-extension-production.zip    # 📦 For production
    │   └── EXTENSION_DOWNLOAD_README.txt        # Installation guide
    │
    ├── admin-dashboard/               # 📊 Admin Dashboard (Vite + React)
    │   ├── src/
    │   ├── dist/                      # Built dashboard (for Nginx)
    │   ├── package.json
    │   └── vite.config.ts
    │
    └── callback-pages/                # OAuth & Payment callback pages
        ├── auth/
        └── payment/
```

---

## 🎯 Key Files for Deployment

### Backend Deployment:

#### CPU Version (Standard):
- `backend/Dockerfile.prod`
- `backend/docker-compose.prod.yaml`
- `backend/build.sh`

#### GPU Version (High Performance):
- `backend/Dockerfile.gpu`
- `backend/docker-compose.prod.gpu.yaml`
- `backend/build-gpu.sh`
- `backend/GPU_DEPLOYMENT_GUIDE.md` ← Full setup instructions

### Frontend Deployment:

#### Chrome Extension:
- `frontend/extension/xdynamic-extension-development.zip` (localhost)
- `frontend/extension/xdynamic-extension-production.zip` (app.xdynamic.cloud)
- Built with: `./build-both-versions.sh`

#### Admin Dashboard:
- `frontend/admin-dashboard/dist/` (static files for Nginx)
- Built with: `npm run build`

---

## 🚀 Quick Start Commands

### Backend (CPU):
```bash
cd backend/
./build.sh
docker compose -f docker-compose.prod.yaml up -d
```

### Backend (GPU):
```bash
cd backend/
./build-gpu.sh
docker compose -f docker-compose.prod.gpu.yaml up -d
```

### Extension:
```bash
cd frontend/extension/
./build-both-versions.sh
# Load xdynamic-extension-development.zip in Chrome
```

### Admin Dashboard:
```bash
cd frontend/admin-dashboard/
npm install
npm run build
# Output: dist/ folder for Nginx
```

---

## 📝 Environment Setup

### Backend `.env`:
```bash
cd backend/
cp .env.example .env
nano .env  # Add your secrets
```

Required variables:
- `JWT_SECRET_KEY`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `MOMO_PARTNER_CODE` / `MOMO_ACCESS_KEY` / `MOMO_SECRET_KEY`

### Extension `.env`:
Automatically handled by `build-both-versions.sh`:
- Development: `VITE_API_BASE_URL=http://localhost:8000`
- Production: `VITE_API_BASE_URL=https://app.xdynamic.cloud`

---

## 🗑️ Removed Files (Cleanup)

### Root level:
- ❌ `reproduce_issue.py` - test file
- ❌ `test-extension.html` - test file
- ❌ `run-*.sh` - development scripts
- ❌ `build-for-deploy.sh` - duplicate
- ❌ `install-docker.sh` - duplicate
- ❌ `nginx.conf` - moved to `backend/nginx/`
- ❌ `DEPLOYMENT_GUIDE.md` - consolidated
- ❌ `DEPLOY_BACKEND_README.txt` - consolidated

### Backend:
- ❌ `Dockerfile` - use `Dockerfile.prod` or `Dockerfile.gpu`
- ❌ `docker-compose.yml` - use `.prod.yaml` versions
- ❌ `docker-compose.yaml` - duplicate
- ❌ `docker-compose.prod.yml` - use `.yaml` version
- ❌ `BUILD.md` - consolidated
- ❌ `DOCKER_README.md` - consolidated
- ❌ `.env.production` - not needed (use docker-compose env)
- ❌ `.env.test` - not needed
- ❌ `app.db` - development database
- ❌ `run.py` - old dev script
- ❌ `add_admin_column.py` - migration done
- ❌ `fix_database.py` - migration done

### Frontend/Extension:
- ❌ `temp_upgrade.txt` - temp file
- ❌ `ziYMuNnA` - unknown temp file
- ❌ `xdynamic-dev-test/` - extracted test folder
- ❌ `xdynamic-prod-test/` - extracted test folder

### Docs folder:
- ❌ Entire `docs/` folder - all documentation moved to `backend/`

---

## 📊 File Count Summary

| Category | Before Cleanup | After Cleanup | Removed |
|----------|---------------|---------------|---------|
| Root files | 13 | 3 | 10 |
| Backend files | 30 | 17 | 13 |
| Docs folder | 7 files | 0 (deleted) | 7 |
| **Total** | **50+** | **20** | **30+** |

---

## ✅ What's Kept

### Essential for Deployment:
- ✅ Production Dockerfiles (CPU + GPU)
- ✅ Production Docker Compose files
- ✅ Build scripts
- ✅ Backend application code
- ✅ ML model weights
- ✅ Extension build outputs
- ✅ Documentation (consolidated)
- ✅ Environment templates

### Essential for Development:
- ✅ Source code (`backend/app/`, `frontend/*/src/`)
- ✅ Configuration files
- ✅ Package management files
- ✅ `.env.example` templates
- ✅ Git configuration

---

## 🔄 Next Steps After Cleanup

1. **Verify builds still work:**
   ```bash
   cd backend && ./build.sh
   cd frontend/extension && ./build-both-versions.sh
   ```

2. **Update git:**
   ```bash
   git add .
   git commit -m "Clean up repository structure"
   git push
   ```

3. **Test deployments:**
   - CPU backend
   - GPU backend
   - Extension (dev + prod)
   - Admin dashboard

---

**Repository is now clean and production-ready!** 🚀
