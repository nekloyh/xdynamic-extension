# 🚀 HƯỚNG DẪN DEPLOY BACKEND LÊN SERVER

## 📋 TÓM TẮT

Dự án backend đã có sẵn Dockerfile. Bạn chỉ cần chuẩn bị 2 files và gửi cho người deploy:

1. **Thư mục `backend/` (toàn bộ)**
2. **File `.env.production` (đã cấu hình)**

## 🎯 CHUẨN BỊ TRƯỚC KHI DEPLOY

### Bước 1: Cấu hình file `.env.production`

```bash
cd backend
cp .env.example .env.production
```

Sau đó sửa file `.env.production` với các thông tin production:

```bash
# App Config
APP_NAME=XDynamic API
DEBUG=false
APP_URL=https://app.xdynamic.cloud/fe

# Database
DATABASE_URL=sqlite:///data/app.db

# JWT Security - QUAN TRỌNG: Tạo secret key mới!
JWT_SECRET_KEY=<secret-key-mạnh-ở-đây>

# Google OAuth (nếu dùng)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://app.xdynamic.cloud/api/auth/google/callback

# MoMo Payment (nếu dùng)
MOMO_PARTNER_CODE=<your-momo-code>
MOMO_ACCESS_KEY=<your-momo-access-key>
MOMO_SECRET_KEY=<your-momo-secret-key>
MOMO_REDIRECT_URL=https://app.xdynamic.cloud/api/payment/success
MOMO_IPN_URL=https://app.xdynamic.cloud/api/payment/momo/ipn

# Plans
PLAN_FREE_MONTHLY_QUOTA=100
PLAN_PLUS_MONTHLY_QUOTA=5000
PLAN_PRO_MONTHLY_QUOTA=999999
PLAN_PLUS_PRICE=99000
PLAN_PRO_PRICE=299000
```

**Tạo JWT Secret Key:**
```bash
# Trên Linux/Mac
openssl rand -hex 32

# Hoặc dùng Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### Bước 2: Kiểm tra các files cần thiết

```bash
cd backend
ls -la

# Phải có các files này:
✓ Dockerfile
✓ requirements.txt
✓ mobilenetv2_dangerous_objects.pth
✓ .env.production
✓ app/ (thư mục)
```

## 📦 GỬI CHO NGƯỜI DEPLOY

### Option 1: Nén thành ZIP

```bash
cd backend
zip -r xdynamic-backend.zip . -x "*.pyc" -x "__pycache__/*" -x ".venv/*" -x "*.db" -x ".env"

# Hoặc dùng tar
tar -czf xdynamic-backend.tar.gz --exclude="*.pyc" --exclude="__pycache__" --exclude=".venv" --exclude="*.db" --exclude=".env" .
```

### Option 2: Push lên Git

```bash
# Đảm bảo .env không bị commit
git add backend/
git commit -m "Prepare backend for production deployment"
git push
```

## 🔧 HƯỚNG DẪN CHO NGƯỜI DEPLOY

Gửi hướng dẫn này cho người deploy của bạn:

---

### HƯỚNG DẪN DEPLOY

#### Yêu cầu server:
- Docker & Docker Compose đã cài đặt
- Port 8000 available (hoặc port khác tùy chọn)
- Ít nhất 2GB RAM, 10GB disk

#### Bước 1: Upload files lên server

```bash
# Upload thư mục backend lên server
scp -r backend/ user@server:/path/to/deployment/

# Hoặc clone từ Git
git clone <repository-url>
cd xdynamic-extension/backend
```

#### Bước 2: Cấu hình environment

```bash
cd backend

# Copy file .env.production thành .env
cp .env.production .env

# Hoặc tạo mới nếu cần
nano .env
```

#### Bước 3: Build Docker image

```bash
# Build image
docker build -t xdynamic-api:latest .

# Hoặc với tag cụ thể
docker build -t xdynamic-api:v1.0.0 .
```

#### Bước 4: Chạy container

**Cách 1: Dùng docker run**

```bash
# Tạo thư mục data
mkdir -p data

# Chạy container
docker run -d \
  --name xdynamic-api \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  xdynamic-api:latest
```

**Cách 2: Dùng docker-compose (Khuyến nghị)**

Tạo file `docker-compose.prod.yaml`:

```yaml
version: '3.8'

services:
  api:
    image: xdynamic-api:latest
    container_name: xdynamic-api
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env
    environment:
      - PYTHONUNBUFFERED=1
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Chạy:
```bash
docker-compose -f docker-compose.prod.yaml up -d
```

#### Bước 5: Kiểm tra API hoạt động

```bash
# Check container đang chạy
docker ps

# Xem logs
docker logs xdynamic-api

# Test API
curl http://localhost:8000/health
# Response: {"status":"ok"}

curl http://localhost:8000/
# Response: API info
```

#### Bước 6: Setup Nginx reverse proxy (Optional nhưng khuyến nghị)

```nginx
server {
    listen 80;
    server_name app.xdynamic.cloud;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Bước 7: Setup SSL với Certbot (Khuyến nghị)

```bash
# Cài Certbot
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d app.xdynamic.cloud

# Auto renewal
sudo certbot renew --dry-run
```

---

## 🔍 TROUBLESHOOTING

### Container không start

```bash
# Xem logs
docker logs xdynamic-api

# Check port conflict
sudo lsof -i :8000
```

### Database errors

```bash
# Vào container
docker exec -it xdynamic-api bash

# Check database
ls -la data/
```

### API không response

```bash
# Check container health
docker inspect xdynamic-api

# Test từ trong container
docker exec xdynamic-api curl http://localhost:8000/health
```

## 📊 MONITORING

### Xem logs

```bash
# Real-time logs
docker logs -f xdynamic-api

# Last 100 lines
docker logs --tail 100 xdynamic-api
```

### Restart container

```bash
docker restart xdynamic-api
```

### Update khi có version mới

```bash
# Pull code mới
git pull

# Rebuild
docker build -t xdynamic-api:latest .

# Stop container cũ
docker-compose -f docker-compose.prod.yaml down

# Start với image mới
docker-compose -f docker-compose.prod.yaml up -d
```

## 🔐 BẢO MẬT

### Checklist bảo mật:
- [ ] JWT_SECRET_KEY đã thay đổi từ mặc định
- [ ] DEBUG=false trong production
- [ ] Database file được backup định kỳ
- [ ] SSL/HTTPS đã được cấu hình
- [ ] Firewall chỉ mở port cần thiết
- [ ] Environment variables không bị expose

### Backup database

```bash
# Backup
docker exec xdynamic-api tar czf /tmp/backup.tar.gz /app/data
docker cp xdynamic-api:/tmp/backup.tar.gz ./backup-$(date +%Y%m%d).tar.gz

# Restore
docker cp backup-20250101.tar.gz xdynamic-api:/tmp/
docker exec xdynamic-api tar xzf /tmp/backup-20250101.tar.gz -C /
docker restart xdynamic-api
```

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Check logs: `docker logs xdynamic-api`
2. Check health: `curl http://localhost:8000/health`
3. Verify .env file có đủ thông tin
4. Check disk space: `df -h`
5. Check memory: `free -h`

---

**Build Date:** 2025-12-04  
**Version:** 1.0.0  
**Docker Image:** xdynamic-api:latest
