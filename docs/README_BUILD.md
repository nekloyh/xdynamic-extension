# 🚀 Quick Start: Build XDynamic Extension

## Cách nhanh nhất để build extension cho production

### 1. Cấu hình Backend URL

Chỉnh sửa file `.env.production`:
```bash
VITE_API_BASE_URL=https://app.xdynamic.cloud
```

### 2. Chạy build script

```bash
cd frontend/extension
./build-production.sh
```

### 3. Lấy file build

Sau khi chạy xong, bạn sẽ có:
- **File `xdynamic-extension.zip`** ← Gửi file này cho users

### 4. Hướng dẫn users cài đặt

Users làm theo:

1. **Giải nén file ZIP**
2. **Mở Chrome** → `chrome://extensions/`
3. **Bật "Developer mode"** (góc trên phải)
4. **Click "Load unpacked"** → Chọn thư mục vừa giải nén
5. **Done!** Extension tự động kết nối đến backend production

---

## Alternative: Build thủ công

```bash
# Cài dependencies
npm install

# Build với production config
npm run build:production

# Tạo ZIP file
npm run zip
```

---

## Xem hướng dẫn chi tiết

Đọc file `BUILD_INSTRUCTIONS.md` để biết thêm về:
- Publish lên Chrome Web Store
- Troubleshooting
- Update extension
- Cấu hình backend CORS
