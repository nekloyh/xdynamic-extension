# 🎯 QUICK START - Environment Configuration

## ✅ Vấn đề đã giải quyết

Bạn không còn bị lẫn lộn giữa:
- ❌ URL local vs test vs production
- ❌ Test credentials vs production credentials
- ❌ DEBUG=true vs DEBUG=false

## 🚀 Các lệnh cơ bản

### Backend

```bash
# 🏠 Chạy LOCAL (máy tính)
python backend/run.py --env development --reload

# 🧪 Chạy TEST (server test)
python backend/run.py --env test

# 🚀 Chạy PRODUCTION (server production)
python backend/run.py --env production --workers 4
```

### Frontend - Extension

```bash
# 🏠 Dev local
cd frontend/extension
npm run dev

# 🧪 Build test
npm run build -- --mode test

# 🚀 Build production
npm run build -- --mode production
```

### Frontend - Admin Dashboard

```bash
# 🏠 Dev local (port 3000)
cd frontend/admin-dashboard
npm run dev

# 🧪 Build test
npm run build

# 🚀 Build production
npm run build
```

**Hoặc dùng helper scripts:**
```bash
./run-admin-dashboard.sh development dev      # Dev local
./run-admin-dashboard.sh test build           # Build test
./run-admin-dashboard.sh production build     # Build production
```

## 📁 File đã tạo/cập nhật

### Backend
- ✅ `.env` - Development (localhost)
- ✅ `.env.test` - Test (test.xdynamic.cloud)
- ✅ `.env.production` - Production (app.xdynamic.cloud)
- ✅ `app/config/settings.py` - Tự động load đúng file
- ✅ `run.py` - Thêm `--env` flag

### Frontend
- ✅ `.env.development` - Local dev
- ✅ `.env.test` - Test config
- ✅ `.env.production` - Production config (có sẵn)
- ✅ `vite.config.ts` - Load `.env.*` tự động

### Admin Dashboard
- ✅ `.env.development` - Local dev (port 3000)
- ✅ `.env.test` - Test config
- ✅ `.env.production` - Production config
- ✅ `vite.config.ts` - Load `.env.*` tự động

### Scripts
- ✅ `run-backend.sh` - Dễ chạy backend
- ✅ `run-frontend.sh` - Dễ chạy extension
- ✅ `run-admin-dashboard.sh` - Dễ chạy admin dashboard

## 📖 Chi tiết

Xem file `ENVIRONMENT_SETUP_GUIDE.md` để biết thêm chi tiết:
- Cách sử dụng từng environment
- Nội dung mỗi file .env
- Troubleshooting
- Cheat sheet

## ⚡ Lợi ích

✨ **Rõ ràng** - Luôn biết đang chạy ở đâu  
🔒 **An toàn** - Không nhầm credentials  
🔄 **Dễ chuyển** - Chỉ cần change flag  
📊 **Debug tốt** - Log riêng cho mỗi env  
🚀 **Tự động** - Load đúng URLs  

---

**Đến bây giờ, bạn đã xong! 🎉**

Khi cần deploy test → `--env test`  
Khi cần production → `--env production`  
Khi phát triển local → `--env development`

Không bị lẫn lộn nữa! 💪
