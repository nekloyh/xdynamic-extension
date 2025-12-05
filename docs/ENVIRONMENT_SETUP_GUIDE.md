# 📚 Hướng dẫn Environment Management

## ⚡ Giải pháp không bị lẫn lộn giữa Development, Test & Production

### 📝 Tóm tắt

Bây giờ bạn có **3 environment** riêng biệt:
- **`.env`** - Development (máy local)
- **`.env.test`** - Test/Staging (server test)
- **`.env.production`** - Production (server production)

---

## 🎯 Cách sử dụng Backend

### 1. Chạy LOCAL để develop:
```bash
# Cách 1: Mặc định (sẽ dùng .env)
python run.py --reload

# Cách 2: Chỉ định rõ
python run.py --env development --reload
```
✅ Sẽ load `.env` (localhost URLs)

### 2. Chạy TEST deployment:
```bash
python run.py --env test

# Hoặc test với auto-reload
python run.py --env test --reload
```
✅ Sẽ load `.env.test` (test.xdynamic.cloud URLs)

### 3. Chạy PRODUCTION:
```bash
python run.py --env production --workers 4

# Hoặc test production config locally
python run.py --env production --host 0.0.0.0 --port 8000
```
✅ Sẽ load `.env.production` (app.xdynamic.cloud URLs)

---

## 🎨 Cách sử dụng Frontend

### Extension:

#### 1. Development (máy local):
```bash
cd frontend/extension
npm run dev  # Hoặc pnpm dev

# Sẽ load .env.development
# VITE_API_BASE_URL=http://localhost:8000
```

#### 2. Build cho TEST:
```bash
cd frontend/extension

# Build test version
npm run build -- --mode test

# Hoặc set environment trước
NODE_ENV=test npm run build
```
✅ Sẽ load `.env.test`
✅ API URL sẽ là `https://test.xdynamic.cloud`

#### 3. Build cho PRODUCTION:
```bash
cd frontend/extension

# Build production version
npm run build -- --mode production

# Hoặc
NODE_ENV=production npm run build
```
✅ Sẽ load `.env.production`
✅ API URL sẽ là `https://app.xdynamic.cloud`

### Admin Dashboard:

#### 1. Development (máy local):
```bash
cd frontend/admin-dashboard
npm run dev

# Sẽ load .env.development
# VITE_API_BASE_URL=http://localhost:8000
# Chạy ở port 3000
```

#### 2. Build cho TEST:
```bash
cd frontend/admin-dashboard
npm run build

# Hoặc với NODE_ENV
NODE_ENV=test npm run build
```
✅ Sẽ load `.env.test`
✅ API URL sẽ là `https://test.xdynamic.cloud`

#### 3. Build cho PRODUCTION:
```bash
cd frontend/admin-dashboard
npm run build

# Hoặc
NODE_ENV=production npm run build
```
✅ Sẽ load `.env.production`
✅ API URL sẽ là `https://app.xdynamic.cloud`

---

## 📄 Nội dung các file .env

### `.env` (Development)
```
DEBUG=true
APP_URL=http://localhost:8000/fe
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

### `.env.test` (Test/Staging)
```
DEBUG=true
APP_URL=https://test.xdynamic.cloud/fe
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
GOOGLE_REDIRECT_URI=https://test.xdynamic.cloud/api/auth/google/callback
```

### `.env.production` (Production)
```
DEBUG=false
APP_URL=https://app.xdynamic.cloud/fe
MOMO_ENDPOINT=https://payment.momo.vn/v2/gateway/api/create
GOOGLE_REDIRECT_URI=https://app.xdynamic.cloud/api/auth/google/callback
```

---

## ✅ Ưu điểm của cách này

1. ✨ **Rõ ràng** - Biết đang chạy ở đâu
2. 🔒 **An toàn** - Không nhầm production credentials vào test
3. 🔄 **Dễ chuyển** - Chỉ cần change `--env` flag
4. 📊 **Debug tốt** - Mỗi environment có log riêng
5. 🚀 **Tự động** - Load đúng URLs mà không cần thay thủ công

---

## 🐛 Troubleshooting

### Vẫn load sai .env?
- Kiểm tra biến môi trường: `echo $ENV_FILE`
- Xóa Python cache: `rm -rf app/__pycache__ backend/__pycache__`
- Xóa Node cache: `rm -rf node_modules .vite`

### API URLs không đúng?
- Check file `.env*` xem URL có đúng không
- Kiểm tra output của `python run.py` - nó sẽ in ra đang load file nào
- Kiểm tra Network tab trong DevTools xem request gửi đến đâu

### Build frontend sai?
- Xóa `dist/` folder
- Check `.env.test` hoặc `.env.production` có config đúng không
- Rebuild: `npm run build -- --mode production`

---

## 📌 Cheat Sheet

```bash
# Backend
python run.py --env development --reload   # Local dev
python run.py --env test                   # Test server
python run.py --env production             # Production

# Frontend
npm run dev                                 # Local dev
npm run build -- --mode test               # Build test
npm run build -- --mode production         # Build production
```

Enjoy! 🎉
