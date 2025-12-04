# ⚡ TL;DR - Admin Dashboard Vào Được Rồi!

## 🎯 Vấn đề
Admin dashboard chưa vào được local dev

## ✅ Giải pháp
Đã tạo các file `.env` cho admin-dashboard:
- `.env.development` → `http://localhost:8000` ✅
- `.env.test` → `https://test.xdynamic.cloud`
- `.env.production` → `https://app.xdynamic.cloud`

---

## 🚀 Để vào admin local DEV - Làm này:

### Terminal 1: Chạy Backend
```bash
cd backend
python run.py --env development --reload
```
✅ Backend sẽ chạy ở `http://localhost:8000`

### Terminal 2: Chạy Admin Dashboard
```bash
cd frontend/admin-dashboard
npm run dev
```
✅ Admin sẽ chạy ở `http://localhost:3000`

### Terminal 3 (Optional): Chạy Extension
```bash
cd frontend/extension
npm run dev
```
✅ Extension sẽ chạy ở `http://localhost:5173`

---

## 🔑 Login Admin

Vào http://localhost:3000 sau đó login:

**Email:** admin@example.com (hoặc email của user `is_admin=true`)
**Password:** (theo setup database của bạn)

---

## 📋 Nếu chạy mà lỗi

### "Cannot reach backend"
```bash
# Check backend chạy không
curl http://localhost:8000/health
# Nên thấy: {"status":"ok"}
```

### "Admin privileges required"
```bash
# Update user thành admin
sqlite3 backend/data/app.db "UPDATE users SET is_admin=true WHERE email='your-email@example.com';"
```

### "Port 3000 already in use"
```bash
# Kill process dùng port 3000
lsof -i :3000
kill -9 <PID>
```

---

## 🔄 Switch Environment

### Test Environment
```bash
NODE_ENV=test npm run build
```

### Production Environment
```bash
NODE_ENV=production npm run build
```

---

## 📁 Files đã tạo

✅ `frontend/admin-dashboard/.env.development`
✅ `frontend/admin-dashboard/.env.test`
✅ `frontend/admin-dashboard/.env.production`
✅ `frontend/admin-dashboard/vite.config.ts` (updated)
✅ `run-admin-dashboard.sh` (helper script)

---

**Done! 🎉 Admin bây giờ vào được local.**

Xem chi tiết: `ADMIN_DASHBOARD_LOCAL_SETUP.md`
