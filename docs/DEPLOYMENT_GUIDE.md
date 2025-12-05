# 🎯 HƯỚNG DẪN BUILD VÀ PHÂN PHỐI EXTENSION

## TÓM TẮT NHANH

Bạn cần build extension để gửi cho users? Làm theo 3 bước:

### Bước 1: Cấu hình Backend URL
```bash
# Sửa file: .env.production
VITE_API_BASE_URL=https://app.xdynamic.cloud
```

### Bước 2: Build

**Linux/Mac:**
```bash
cd frontend/extension
./build-production.sh
```

**Windows:**
```cmd
cd frontend\extension
build-production.bat
```

**Hoặc dùng npm:**
```bash
npm run zip
```

### Bước 3: Gửi file
Gửi file **`xdynamic-extension.zip`** cho users!

---

## CHI TIẾT TỪNG BƯỚC

### 📋 Yêu cầu

- Node.js 18+
- npm hoặc pnpm
- Backend đã deploy tại `https://app.xdynamic.cloud`

### 🔧 Bước 1: Cấu hình

1. **Vào thư mục extension:**
   ```bash
   cd frontend/extension
   ```

2. **Tạo/sửa file `.env.production`:**
   ```bash
   VITE_API_BASE_URL=https://app.xdynamic.cloud
   VITE_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
   VITE_ENV=production
   ```

   > ⚠️ **Quan trọng**: Thay `https://app.xdynamic.cloud` bằng domain backend thật của bạn!

3. **Kiểm tra Google OAuth:**
   - Vào [Google Cloud Console](https://console.cloud.google.com)
   - Tạo OAuth 2.0 credentials
   - Thêm Authorized redirect URI:
     ```
     https://app.xdynamic.cloud/api/auth/google/callback
     ```
   - Copy Client ID vào `.env.production`

### 🏗️ Bước 2: Build Extension

#### Cách 1: Dùng build script (Khuyến nghị)

**Linux/Mac:**
```bash
chmod +x build-production.sh
./build-production.sh
```

**Windows:**
```cmd
build-production.bat
```

Script tự động:
- ✓ Kiểm tra cấu hình
- ✓ Cài dependencies
- ✓ Clean build cũ
- ✓ Build extension
- ✓ Tạo file ZIP

#### Cách 2: Build thủ công

```bash
# Cài dependencies
npm install

# Build
npm run build:production

# Tạo ZIP
npm run zip
```

#### Cách 3: Chỉ build, không tạo ZIP

```bash
npm run build:production
```

Kết quả trong thư mục `dist/`

### 📦 Bước 3: Lấy file build

Sau khi build xong, bạn có:

```
frontend/extension/
├── dist/                          ← Thư mục extension đã build
│   ├── manifest.json             
│   ├── README.txt                 ← Hướng dẫn cài đặt cho users
│   ├── icons/
│   ├── assets/
│   └── ...
└── xdynamic-extension.zip         ← File ZIP để phân phối
```

### 🚀 Bước 4: Phân phối

#### Option A: Gửi file ZIP (Đơn giản nhất)

1. Gửi file `xdynamic-extension.zip` cho users
2. Hướng dẫn họ:
   - Giải nén file
   - Vào `chrome://extensions/`
   - Bật Developer mode
   - Click "Load unpacked" và chọn thư mục đã giải nén

#### Option B: Gửi thư mục dist (Không cần giải nén)

1. Nén thư mục `dist/` thành ZIP
2. Gửi cho users
3. Họ giải nén và load vào Chrome như trên

#### Option C: Publish lên Chrome Web Store (Chuyên nghiệp)

1. Truy cập [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Tạo tài khoản ($5 one-time fee)
3. Click "New Item"
4. Upload `xdynamic-extension.zip`
5. Điền thông tin extension
6. Submit để review
7. Sau khi approve, users cài từ Chrome Web Store

---

## 📝 HƯỚNG DẪN CHO USERS

### Cài đặt từ file ZIP

**Bước 1: Giải nén**
```bash
unzip xdynamic-extension.zip -d xdynamic-extension
```

**Bước 2: Mở Chrome Extensions**
- Mở Chrome
- Vào `chrome://extensions/`
- Bật "Developer mode" (góc phải trên)

**Bước 3: Load Extension**
- Click "Load unpacked"
- Chọn thư mục `xdynamic-extension` vừa giải nén
- Done!

**Bước 4: Sử dụng**
- Click icon extension trên toolbar
- Login hoặc dùng Free plan
- Scan trang web để phát hiện nội dung nhạy cảm

---

## 🔍 KIỂM TRA BUILD

### Test local trước khi gửi

1. **Load extension vào Chrome:**
   ```
   chrome://extensions/ → Load unpacked → chọn dist/
   ```

2. **Test các tính năng:**
   - ✓ Login/Register
   - ✓ Scan trang web
   - ✓ Filter settings
   - ✓ Dashboard/statistics
   - ✓ Payment (nếu có)

3. **Kiểm tra kết nối API:**
   - Mở DevTools (F12)
   - Vào tab Network
   - Test scan ảnh
   - Xem request gọi đến đúng domain chưa:
     ```
     https://app.xdynamic.cloud/api/v1/predict
     ```

4. **Kiểm tra console errors:**
   - Right-click icon extension → "Inspect popup"
   - Xem Console tab
   - Không có lỗi đỏ = OK ✓

### Verify build settings

```bash
# Xem API URL trong manifest
cat dist/manifest.json | grep -A 5 host_permissions

# Kiểm tra version
cat dist/manifest.json | grep version
```

---

## 🐛 TROUBLESHOOTING

### Build failed

```bash
# Clean và rebuild
npm run clean
npm install
npm run build:production
```

### Extension không kết nối Backend

1. **Kiểm tra backend có chạy không:**
   ```bash
   curl https://app.xdynamic.cloud/health
   # Phải trả về: {"status": "ok"}
   ```

2. **Kiểm tra CORS của backend:**
   
   Backend `main.py` phải có:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "https://app.xdynamic.cloud",
           "chrome-extension://*",
           "*",
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Test CORS từ terminal:**
   ```bash
   curl -H "Origin: chrome-extension://test" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: authorization" \
        -X OPTIONS \
        https://app.xdynamic.cloud/api/v1/predict -v
   ```
   
   Phải có header: `Access-Control-Allow-Origin: *`

### OAuth không hoạt động

1. Google Cloud Console → OAuth 2.0 Client IDs
2. Thêm Authorized redirect URIs:
   ```
   https://app.xdynamic.cloud/api/auth/google/callback
   ```
3. Thêm Authorized JavaScript origins:
   ```
   https://app.xdynamic.cloud
   ```

### Extension bị Chrome chặn

- Chỉ xảy ra khi publish lên Chrome Web Store
- Cần verify domain ownership
- Khi dev, dùng "Load unpacked" không bị chặn

---

## 🔄 UPDATE EXTENSION

### Khi cần release phiên bản mới:

1. **Update version trong `manifest.ts`:**
   ```typescript
   version: "1.0.1"  // hoặc "1.1.0", "2.0.0"
   ```

2. **Rebuild:**
   ```bash
   ./build-production.sh
   ```

3. **Phân phối:**
   - Gửi file ZIP mới cho users
   - Hoặc upload lên Chrome Web Store

4. **Users update:**
   - Nếu từ Chrome Web Store: tự động update
   - Nếu load unpacked: click nút refresh trong `chrome://extensions/`

---

## 📊 CHECKLIST TRƯỚC KHI PHÂN PHỐI

### Backend
- [ ] Backend đã deploy lên server
- [ ] API `/health` trả về OK
- [ ] CORS đã cấu hình cho `chrome-extension://*`
- [ ] Database đã khởi tạo
- [ ] Model weights đã upload
- [ ] Google OAuth credentials đã tạo
- [ ] MoMo payment credentials đã cấu hình (optional)

### Extension
- [ ] File `.env.production` đã cấu hình đúng URL
- [ ] Google Client ID đã điền
- [ ] Version trong `manifest.ts` đã update
- [ ] Build thành công không có errors
- [ ] Test extension local hoạt động OK
- [ ] File README.txt trong dist/ có đầy đủ hướng dẫn

### Distribution
- [ ] File `xdynamic-extension.zip` đã tạo
- [ ] File ZIP có dung lượng hợp lý (5-10MB)
- [ ] Đã test giải nén và load vào Chrome
- [ ] Đã test trên máy sạch (không phải dev machine)

---

## 📞 SUPPORT

Nếu gặp vấn đề:

1. Đọc lại hướng dẫn
2. Kiểm tra console errors
3. Test backend riêng
4. Xem file `BUILD_INSTRUCTIONS.md` để biết thêm chi tiết

---

**Happy Building! 🚀**
