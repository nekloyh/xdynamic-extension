# 📦 Hướng dẫn Build và Deploy XDynamic Extension

## 🎯 Build Extension cho Production

### Bước 1: Cấu hình Production Environment

Tạo file `.env.production` với thông tin backend production:

```bash
VITE_API_BASE_URL=https://app.xdynamic.cloud
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
VITE_ENV=production
VITE_ADMIN_DASHBOARD_URL=https://admin.xdynamic.cloud
```

### Bước 2: Build Extension

Chạy lệnh build production:

```bash
# Cài đặt dependencies (nếu chưa có)
npm install

# Build với production config
npm run build:production

# Hoặc build + tạo file ZIP luôn
npm run zip
```

### Bước 3: Lấy file build

Sau khi build xong, bạn sẽ có:
- **Thư mục `dist/`**: Chứa toàn bộ extension đã build
- **File `xdynamic-extension.zip`**: File ZIP để submit lên Chrome Web Store

## 📤 Phân phối Extension

### Cách 1: Gửi folder `dist/` 

```bash
# Nén thư mục dist
cd dist
zip -r xdynamic-extension.zip .
```

Gửi file `xdynamic-extension.zip` cho người dùng.

### Cách 2: Gửi luôn file ZIP đã build

```bash
# Chạy lệnh tự động build + zip
npm run zip
```

File `xdynamic-extension.zip` sẽ được tạo ở thư mục root.

## 🔧 Cài đặt Extension từ file ZIP

### Người dùng làm như sau:

1. **Giải nén file ZIP**
   ```bash
   unzip xdynamic-extension.zip -d xdynamic-extension
   ```

2. **Mở Chrome và vào Extensions**
   - Truy cập: `chrome://extensions/`
   - Bật "Developer mode" (góc trên bên phải)

3. **Load Extension**
   - Click "Load unpacked"
   - Chọn thư mục vừa giải nén (`xdynamic-extension/`)
   - Extension sẽ được cài đặt và tự động kết nối tới `https://app.xdynamic.cloud`

## 🌐 Cấu hình Backend Production

Đảm bảo backend đã được cấu hình:

### Backend `.env` phải có:

```bash
# App
APP_URL=https://app.xdynamic.cloud/fe
DEBUG=False

# CORS - thêm domain của extension nếu publish lên Chrome Web Store
# Khi publish, Chrome extension sẽ có ID dạng: chrome-extension://abcdefghijklmnop...
```

### Backend `main.py` - CORS config:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://app.xdynamic.cloud",
        "https://admin.xdynamic.cloud", 
        "chrome-extension://*",  # Cho phép tất cả Chrome extensions
        "*",  # Hoặc cụ thể hơn nếu cần
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📋 Checklist trước khi Deploy

- [ ] Backend đã deploy lên `app.xdynamic.cloud`
- [ ] Backend API `/health` trả về OK
- [ ] CORS đã được cấu hình cho Chrome extension
- [ ] Google OAuth credentials đã tạo và cấu hình
- [ ] MoMo payment credentials đã cấu hình (nếu dùng)
- [ ] Database đã được khởi tạo
- [ ] Model weights đã upload lên server
- [ ] File `.env.production` đã cấu hình đúng
- [ ] Version trong `manifest.ts` đã update

## 🚀 Publish lên Chrome Web Store (Optional)

### Bước 1: Chuẩn bị assets

Cần có:
- Icon 128x128 (đã có trong `public/icons/`)
- Screenshots của extension
- Promotional images (1280x800 hoặc 640x400)
- Privacy policy URL
- Description và marketing text

### Bước 2: Upload

1. Truy cập [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Tạo tài khoản developer ($5 one-time fee)
3. Click "New Item"
4. Upload file `xdynamic-extension.zip`
5. Điền thông tin:
   - Name, description
   - Category: Productivity
   - Icons & screenshots
   - Privacy policy
6. Submit for review

### Bước 3: Sau khi được approve

Extension sẽ có URL dạng:
```
https://chrome.google.com/webstore/detail/[extension-id]
```

Người dùng có thể cài đặt trực tiếp từ Chrome Web Store.

## 🐛 Troubleshooting

### Extension không kết nối được Backend

1. Kiểm tra `VITE_API_BASE_URL` trong build:
   ```bash
   # Xem file manifest đã build
   cat dist/manifest.json | grep -A 5 host_permissions
   ```

2. Test API từ browser:
   ```bash
   curl https://app.xdynamic.cloud/health
   ```

3. Kiểm tra CORS headers:
   ```bash
   curl -H "Origin: chrome-extension://test" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: authorization" \
        -X OPTIONS \
        https://app.xdynamic.cloud/api/v1/predict
   ```

### Extension bị lỗi khi load

1. Kiểm tra console errors:
   - Right-click extension icon → "Inspect popup"
   - Xem Console tab

2. Rebuild extension:
   ```bash
   npm run clean
   npm run build:production
   ```

### OAuth không hoạt động

1. Google Cloud Console → Credentials
2. Thêm Authorized redirect URIs:
   ```
   https://app.xdynamic.cloud/api/auth/google/callback
   ```
3. Thêm Authorized JavaScript origins:
   ```
   https://app.xdynamic.cloud
   chrome-extension://[your-extension-id]
   ```

## 📝 Notes

- Extension sẽ tự động dùng `VITE_API_BASE_URL` từ file `.env.production`
- Không cần hardcode API URL trong code
- Mỗi lần thay đổi backend URL, cần rebuild extension
- User không cần cấu hình gì, chỉ cần install extension là xong

## 🔄 Update Extension

Khi có phiên bản mới:

1. Update version trong `manifest.ts`:
   ```typescript
   version: "1.0.1"  // hoặc "1.1.0", "2.0.0"
   ```

2. Rebuild:
   ```bash
   npm run zip
   ```

3. Phân phối file ZIP mới cho users

Nếu đã publish lên Chrome Web Store:
- Upload version mới lên Developer Dashboard
- Users sẽ tự động nhận update
