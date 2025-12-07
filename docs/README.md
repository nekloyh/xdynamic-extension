# 📚 Documentation Index

## 🎯 Tìm nhanh những gì bạn cần

### 🚀 Muốn chạy local?
→ [QUICK_START.md](QUICK_START.md)

### 🏗️ Muốn hiểu project structure?
→ [ARCHITECTURE.md](ARCHITECTURE.md)

### 🐳 Muốn build & deploy backend với Docker?
→ [DOCKER_QUICK_START.md](../backend/DOCKER_QUICK_START.md) hoặc [DEPLOY_TO_SERVER.md](../backend/DEPLOY_TO_SERVER.md)

### 📱 Muốn build extension cho users?
→ [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### 🎛️ Muốn setup admin dashboard?
→ [ADMIN_DASHBOARD_LOCAL_SETUP.md](ADMIN_DASHBOARD_LOCAL_SETUP.md)

### 📋 Muốn xem changelog?
→ [ADMIN_FIX_SUMMARY.md](ADMIN_FIX_SUMMARY.md)

---

## 📖 Tất cả Documentation

### Backend
| File | Mục đích |
|------|---------|
| `DOCKER_QUICK_START.md` | Build Docker image nhanh |
| `DOCKER_BUILD_GUIDE.md` | Hướng dẫn chi tiết build Docker |
| `DEPLOY_TO_SERVER.md` | Deploy lên server production |
| `install-docker.sh` | Script cài Docker trên server |

### Frontend
| File | Mục đích |
|------|---------|
| `DEPLOYMENT_GUIDE.md` | Build extension & phân phối cho users |
| `ADMIN_DASHBOARD_LOCAL_SETUP.md` | Setup admin dashboard locally |

### General
| File | Mục đích |
|------|---------|
| `ARCHITECTURE.md` | Cấu trúc & thiết kế project |
| `QUICK_START.md` | Commands nhanh để chạy local |
| `ADMIN_FIX_SUMMARY.md` | Log của bugs fixed & improvements |

---

## 🔍 Workflow theo Role

### 👨‍💻 Developer (Local Development)
1. Read: [QUICK_START.md](QUICK_START.md)
2. Read: [ARCHITECTURE.md](ARCHITECTURE.md)
3. Start: `python backend/run.py --reload` + `npm run dev` (frontend/extension)
4. Check: [CONTRIBUTING.md](../CONTRIBUTING.md) before contributing

### 🚀 DevOps / System Admin (Deployment)
1. Read: [DOCKER_QUICK_START.md](../backend/DOCKER_QUICK_START.md)
2. Read: [DEPLOY_TO_SERVER.md](../backend/DEPLOY_TO_SERVER.md)
3. Run: `cd backend && ./full-deploy.sh build test deploy`
4. Monitor: Docker logs, health checks

### 📦 Release Manager (Extension Distribution)
1. Read: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Run: `cd frontend/extension && npm run build && ./build-production.sh`
3. Share: ZIP file to users or upload to Chrome Web Store

### 🎛️ Admin (Dashboard Management)
1. Read: [ADMIN_DASHBOARD_LOCAL_SETUP.md](ADMIN_DASHBOARD_LOCAL_SETUP.md)
2. Access: http://localhost:3000 (local) or https://admin.xdynamic.cloud (production)
3. Manage: Users, subscriptions, analytics

---

## 📋 Project Checklist

### Before First Run
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] `.env` files created from `.env.example`
- [ ] Dependencies installed (`pip install -r requirements.txt`, `npm install`)

### Before Local Testing
- [ ] Backend runs without errors
- [ ] Extension loads in Chrome
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Health check passes: `curl http://localhost:8000/health`

### Before Deployment
- [ ] All tests pass
- [ ] `.env.production` configured with real credentials
- [ ] Docker image builds successfully
- [ ] Health check works in Docker
- [ ] SSL/HTTPS configured on server

---

## 🆘 Quick Troubleshooting

### Backend won't start?
```bash
cd backend
python run.py --reload
# Check: http://localhost:8000/health
```

### Extension can't connect?
- Check VITE_API_BASE_URL in frontend/.env
- Ensure backend is running
- Check browser console for CORS errors

### Docker build fails?
```bash
cd backend
./setup-docker.sh  # Run requirements check
docker build -f Dockerfile.prod --no-cache -t xdynamic-api:latest .
```

More help: See relevant documentation file above

---

## 📞 Support

- **Local Issues:** Check QUICK_START.md
- **Docker Issues:** Check DOCKER_BUILD_GUIDE.md or DEPLOY_TO_SERVER.md
- **Extension Issues:** Check DEPLOYMENT_GUIDE.md
- **Architecture Questions:** Check ARCHITECTURE.md

---

**Last Updated:** December 7, 2024
