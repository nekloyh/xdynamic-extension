# 🎨 Admin Dashboard - Local Setup Guide

## ✅ Vấn đề đã giải quyết
Admin dashboard bây giờ có:
- ✅ `.env.development` - Cấu hình local
- ✅ `.env.test` - Cấu hình test
- ✅ `.env.production` - Cấu hình production
- ✅ Tự động load URL từ environment variables
- ✅ Helper script `run-admin-dashboard.sh`

---

## 🚀 Chạy Admin Dashboard Local

### Cách 1: Dùng npm trực tiếp

```bash
# Vào thư mục admin-dashboard
cd frontend/admin-dashboard

# Chạy dev server (sẽ mở port 3000)
npm run dev

# Hoặc chỉ định environment
NODE_ENV=development npm run dev
```

**URL:** http://localhost:3000

### Cách 2: Dùng helper script (nhanh hơn)

```bash
# Từ thư mục root của project
./run-admin-dashboard.sh development dev

# Hoặc ngắn gọn hơn
./run-admin-dashboard.sh
```

---

## 🔧 Cấu hình API URL

### File `.env.development`
```
VITE_API_BASE_URL=http://localhost:8000
```

Điều này có nghĩa:
- Admin dashboard sẽ gọi API từ `http://localhost:8000`
- Cùng backend như extension khi dev local

### Kiểm tra URL được load

```bash
# Check xem .env.development được load đúng không
cat frontend/admin-dashboard/.env.development

# Expected output:
# VITE_API_BASE_URL=http://localhost:8000
```

---

## 📋 Checklist Local Setup

### 1. Backend chạy chưa?
```bash
# Terminal 1
cd backend
python run.py --env development --reload

# Verify: http://localhost:8000/health
# Nên thấy: {"status": "ok"}
```

### 2. Admin Dashboard chạy chưa?
```bash
# Terminal 2
cd frontend/admin-dashboard
npm run dev

# Verify: http://localhost:3000
# Nên thấy: Login page
```

### 3. Login vào admin dashboard

**Credential để test:**
- Email: admin@example.com (hoặc email của user có `is_admin=true`)
- Password: (tùy setup database)

> **Note:** User phải có `is_admin=true` trong database mới login được

---

## 🐛 Troubleshooting Admin Dashboard

### ❌ "API URL sai" hoặc "Cannot reach backend"

**Kiểm tra:**
1. Backend chạy chưa? 
   ```bash
   curl http://localhost:8000/health
   # Nên thấy: {"status":"ok"}
   ```

2. Port 8000 đúng chưa?
   ```bash
   cat frontend/admin-dashboard/.env.development
   # Nên thấy: VITE_API_BASE_URL=http://localhost:8000
   ```

3. Clear cache & rebuild:
   ```bash
   rm -rf frontend/admin-dashboard/node_modules/.vite
   npm run dev
   ```

### ❌ "Admin privileges required"

Nguyên nhân: User login không phải admin

**Giải pháp:**
1. Check database: User có `is_admin=true` không?
   ```bash
   # Từ backend directory
   python -c "from app.database import SessionLocal; from app.models.user import User; db=SessionLocal(); print(db.query(User).filter(User.email=='your-email@example.com').first())"
   ```

2. Update user thành admin:
   ```bash
   # Run từ backend directory
   python backend/add_admin_column.py
   ```

3. Hoặc cập nhật database trực tiếp (SQLite):
   ```bash
   sqlite3 backend/data/app.db "UPDATE users SET is_admin=true WHERE email='your-email@example.com';"
   ```

### ❌ "Port 3000 already in use"

```bash
# Tìm process đang dùng port 3000
lsof -i :3000

# Kill process (nếu cần)
kill -9 <PID>

# Hoặc chạy port khác
npm run dev -- --port 3001
```

### ❌ "Cannot find module" hoặc import errors

```bash
# Clear cache & reinstall
rm -rf frontend/admin-dashboard/node_modules
rm frontend/admin-dashboard/package-lock.json
npm install

# Rebuild
npm run dev
```

---

## 📊 File Structure

```
frontend/admin-dashboard/
├── .env.development ........... ✨ LOCAL config (localhost:8000)
├── .env.test .................. ✨ TEST config (test.xdynamic.cloud)
├── .env.production ............ ✨ PROD config (app.xdynamic.cloud)
├── vite.config.ts ............ ✨ UPDATED (load .env files)
├── src/
│   ├── contexts/AuthContext.tsx
│   │   └── API_URL = import.meta.env.VITE_API_BASE_URL
│   ├── services/admin.service.ts
│   │   └── apiRequest() dùng API_URL
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── ContentAnalytics.tsx
│   │   └── ...
│   └── index.tsx
└── ...
```

---

## 🎯 Typical Development Flow

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
python run.py --env development --reload
# Chạy ở http://localhost:8000
```

### Step 2: Start Admin Dashboard (Terminal 2)
```bash
cd frontend/admin-dashboard
npm run dev
# Chạy ở http://localhost:3000
```

### Step 3: Start Extension Dev (Terminal 3) - Optional
```bash
cd frontend/extension
npm run dev
# Chạy ở http://localhost:5173
```

### Step 4: Login & Test

1. Mở http://localhost:3000
2. Login bằng admin account
3. Test các features:
   - View dashboard stats
   - Manage users
   - View reports
   - System settings
   - Analytics

---

## 🔄 Environment Switching

### Test Environment

```bash
# Build test version
NODE_ENV=test npm run build

# Hoặc
./run-admin-dashboard.sh test build

# Upload lên test server
# Chạy lệnh deploy test
```

### Production Environment

```bash
# Build production version
NODE_ENV=production npm run build

# Hoặc
./run-admin-dashboard.sh production build

# Upload lên production server
# Chạy lệnh deploy production
```

---

## 📝 Development Tips

### Hot Reload
- Vite hỗ trợ HMR (Hot Module Replacement)
- Sửa code → Tự động reload browser (cách mất session)

### DevTools
```bash
# Inspect API requests
# DevTools > Network tab > Filter "api/"

# Inspect local storage
# DevTools > Application > Local Storage
# Token lưu ở key: "admin_token"
```

### Debug Mode
```bash
# Enable console logs
# Frontend DevTools > Console
# Xem tất cả API calls
```

---

## ✨ Next Steps

1. ✅ Chạy admin dashboard local
2. ✅ Login bằng admin account
3. ✅ Test tất cả features
4. ✅ Khi ready → build test
5. ✅ Deploy test server
6. ✅ QA test
7. ✅ Build production
8. ✅ Deploy production

---

## 📚 Tài liệu liên quan

- `QUICK_START.md` - Hướng dẫn nhanh tất cả apps
- `ENVIRONMENT_SETUP_GUIDE.md` - Chi tiết toàn bộ setup
- `ENVIRONMENT_SETUP_CHECKLIST.md` - Verify & troubleshoot

**Enjoy! 🎉**
