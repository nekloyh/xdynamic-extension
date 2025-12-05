# 🚀 HƯỚNG DẪN ĐƠN GIẢN - DEPLOY BACKEND

## TÓM TẮT: Bạn chỉ cần làm 2 việc!

### 1️⃣ Chuẩn bị file gửi (5 phút)

```bash
cd backend

# Sửa file .env.production với domain thật
nano .env.production

# Chạy script tự động
./prepare-for-deploy.sh
```

Script sẽ tạo ra:
- ✅ File `xdynamic-backend-YYYYMMDD-HHMMSS.tar.gz` (khoảng 10MB)
- ✅ File `SEND_TO_DEPLOY.txt` (hướng dẫn)

### 2️⃣ Gửi cho bạn deploy

Gửi 2 files vừa tạo:
```
xdynamic-backend-20251204-xxxxx.tar.gz
SEND_TO_DEPLOY.txt
```

**Done!** Bạn của bạn chỉ cần 3 lệnh để deploy.

---

## CHI TIẾT TỪNG BƯỚC

### Bước 1: Cấu hình .env.production

```bash
cd backend
nano .env.production
```

**Những gì CẦN PHẢI sửa:**

```bash
# Domain của server
APP_URL=https://app.xdynamic.cloud/fe

# Tắt debug mode
DEBUG=false

# Tạo JWT secret mới (QUAN TRỌNG!)
JWT_SECRET_KEY=<chạy lệnh bên dưới để tạo>

# OAuth callback (nếu dùng)
GOOGLE_REDIRECT_URI=https://app.xdynamic.cloud/api/auth/google/callback

# Payment callback (nếu dùng)
MOMO_REDIRECT_URL=https://app.xdynamic.cloud/api/payment/success
MOMO_IPN_URL=https://app.xdynamic.cloud/api/payment/momo/ipn
```

**Tạo JWT Secret Key:**
```bash
# Cách 1: Dùng openssl
openssl rand -hex 32

# Cách 2: Dùng Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copy kết quả và paste vào `JWT_SECRET_KEY=...`

### Bước 2: Chạy script chuẩn bị

```bash
cd backend
./prepare-for-deploy.sh
```

Script sẽ:
1. ✓ Kiểm tra tất cả files cần thiết
2. ✓ Tạo file nén `xdynamic-backend-YYYYMMDD-HHMMSS.tar.gz`
3. ✓ Tạo file hướng dẫn `SEND_TO_DEPLOY.txt`
4. ✓ Hiển thị tóm tắt

### Bước 3: Gửi files

```bash
# Files nằm ở thư mục cha của backend/
cd ..
ls -lh xdynamic-backend-*.tar.gz SEND_TO_DEPLOY.txt
```

Gửi 2 files này cho bạn deploy qua:
- Email
- Google Drive
- Dropbox
- USB
- SCP/SFTP
- ...

---

## HƯỚNG DẪN CHO BẠN DEPLOY

(Paste nội dung này vào email/message gửi cho họ)

```
Chào bạn,

Tôi gửi bạn backend API để deploy lên server. 
Rất đơn giản, chỉ cần 3 lệnh:

1. Giải nén:
   tar -xzf xdynamic-backend-*.tar.gz
   cd <thư-mục-vừa-giải-nén>

2. Cấu hình:
   cp .env.production .env

3. Deploy:
   ./deploy.sh

API sẽ chạy tại http://localhost:8000

Chi tiết đầy đủ trong file SEND_TO_DEPLOY.txt và DEPLOYMENT_GUIDE.md

Thanks!
```

---

## SAU KHI DEPLOY

### Kiểm tra API hoạt động

```bash
# Test từ server
curl http://localhost:8000/health

# Test từ bên ngoài (sau khi setup domain)
curl https://app.xdynamic.cloud/health

# Phải trả về:
{"status":"ok"}
```

### Kiểm tra logs

```bash
docker logs -f xdynamic-api
```

### Test với Extension

1. Mở extension đã build
2. Login/Register
3. Scan một trang web
4. Kiểm tra có kết nối được không

---

## TROUBLESHOOTING

### Nếu bạn deploy gặp lỗi "Permission denied"

```bash
chmod +x prepare-for-deploy.sh
chmod +x deploy.sh
```

### Nếu thiếu file model

```bash
# Kiểm tra file model có trong backend/
ls -lh mobilenetv2_dangerous_objects.pth

# Nếu không có, cần download hoặc copy từ nơi khác
```

### Nếu .env.production không được tạo

```bash
cp .env.example .env.production
nano .env.production
# Sửa các thông tin production
```

---

## CHECKLIST TRƯỚC KHI GỬI

- [ ] File `.env.production` đã sửa APP_URL đúng domain
- [ ] DEBUG=false
- [ ] JWT_SECRET_KEY đã thay đổi (không dùng default)
- [ ] Google OAuth callback URL đúng (nếu dùng)
- [ ] MoMo callback URL đúng (nếu dùng)
- [ ] File model `mobilenetv2_dangerous_objects.pth` có trong backend/
- [ ] Đã chạy `./prepare-for-deploy.sh` thành công
- [ ] File `.tar.gz` đã được tạo
- [ ] File `SEND_TO_DEPLOY.txt` đã được tạo

---

## CẤU TRÚC FILES GỬI ĐI

```
xdynamic-backend-20251204-xxxxx.tar.gz  (~ 10MB)
├── Dockerfile
├── requirements.txt
├── mobilenetv2_dangerous_objects.pth   (8.8MB - ML model)
├── .env.production                     (Config)
├── deploy.sh                           (Auto deploy script)
├── docker-compose.prod.yaml
├── DEPLOYMENT_GUIDE.md                 (Chi tiết đầy đủ)
└── app/                                (Source code)

SEND_TO_DEPLOY.txt                      (Hướng dẫn nhanh)
```

---

## CÂU HỎI THƯỜNG GẶP

### Q: Bạn tôi cần biết gì về Docker?
A: Chỉ cần biết 3 lệnh cơ bản:
- `docker build` - build image
- `docker run` - chạy container
- `docker logs` - xem logs

Script `deploy.sh` đã làm tất cả rồi.

### Q: Server cần cài gì?
A: Chỉ cần Docker & Docker Compose. Hệ điều hành Linux bất kỳ.

### Q: Có thể deploy trên Windows Server không?
A: Có, nhưng Linux server tốt hơn. Nếu Windows thì cần Docker Desktop.

### Q: Cần database riêng không?
A: Không cần! SQLite đã được bao gồm trong container.

### Q: Làm sao update code sau này?
A: Rebuild và deploy lại:
```bash
docker stop xdynamic-api
docker rm xdynamic-api
./deploy.sh
```

### Q: Port 8000 đã bị chiếm?
A: Sửa trong `docker-compose.prod.yaml`:
```yaml
ports:
  - "8080:8000"  # Đổi 8000 thành port khác
```

---

## KẾT LUẬN

Bạn chỉ cần:
1. ✅ Chạy `./prepare-for-deploy.sh`
2. ✅ Gửi 2 files cho bạn deploy
3. ✅ Done!

Bạn deploy chỉ cần:
1. ✅ Giải nén
2. ✅ `cp .env.production .env`
3. ✅ `./deploy.sh`
4. ✅ Done!

**Đơn giản vậy thôi!** 🎉

---

**Ngày tạo:** 2025-12-04  
**Version:** 1.0.0  
**Contact:** Nếu có vấn đề, đọc DEPLOYMENT_GUIDE.md
