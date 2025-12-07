# XDynamic Backend - Hướng Dẫn Deploy (CPU)

## 📋 Yêu Cầu
- Docker & Docker Compose
- File model: `mobilenetv2_dangerous_objects.pth`
- File `.env` (hoặc sử dụng `.env.example`)

## 🚀 Cách 1: Docker Compose (Khuyến Nghị)

### Build và chạy:
```bash
cd backend
docker-compose -f docker-compose.prod.yaml up -d --build
```

### Kiểm tra:
```bash
# Xem logs
docker-compose -f docker-compose.prod.yaml logs -f

# Kiểm tra health
curl http://localhost/health
curl http://localhost:8000/health
```

### Dừng:
```bash
docker-compose -f docker-compose.prod.yaml down
```

## 🔧 Cách 2: Build Image Riêng

### Build:
```bash
chmod +x build.sh
./build.sh
```

### Run:
```bash
docker run -d \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  xdynamic-api:latest
```

## 📝 Lưu Ý

### Cấu hình môi trường (.env)
- Copy từ `.env.example` nếu chưa có `.env`
- Cập nhật các giá trị JWT_SECRET_KEY, GOOGLE_CLIENT_ID, MOMO_* cho production

### Port
- Backend API: 8000
- Nginx (nếu dùng docker-compose): 80, 443

### Database
- SQLite lưu tại `./data/app.db`
- Volume được mount tự động

### Model
- Đảm bảo có file `mobilenetv2_dangerous_objects.pth` trong thư mục backend

## 🔍 Troubleshooting

### Lỗi build:
```bash
# Xóa cache và build lại
docker system prune -f
docker-compose -f docker-compose.prod.yaml build --no-cache
```

### Lỗi permission:
```bash
chmod +x build.sh
sudo chown -R $USER:$USER data/
```

### Kiểm tra logs:
```bash
docker-compose -f docker-compose.prod.yaml logs backend
docker-compose -f docker-compose.prod.yaml logs nginx
```

## 🎯 Test API

```bash
# Health check
curl http://localhost:8000/health

# API docs
curl http://localhost:8000/docs

# Register user (example)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","full_name":"Test User"}'
```

## 📦 Production

Khi deploy production:
1. Cập nhật domain trong `nginx/conf.d/xdynamic.conf`
2. Cấu hình SSL/TLS certificates
3. Cập nhật `.env` với production values
4. Đặt `DEBUG=false`
5. Backup database định kỳ từ `./data/app.db`
