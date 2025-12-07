╔═══════════════════════════════════════════════════════════════╗
║                   DEPLOY BACKEND - TÓM TẮT                    ║
╚═══════════════════════════════════════════════════════════════╝

🎯 MỤC TIÊU: Gửi backend cho bạn deploy lên server

═══════════════════════════════════════════════════════════════

📝 BẠN CẦN LÀM (2 BƯỚC - 5 PHÚT)
═══════════════════════════════════════════════════════════════

BƯỚC 1: Cấu hình domain production
────────────────────────────────────────────────────────────

cd backend
nano .env.production

Sửa dòng:
  APP_URL=https://app.xdynamic.cloud/fe
  DEBUG=false
  JWT_SECRET_KEY=<tạo-mới>

Tạo JWT Secret:
  openssl rand -hex 32


BƯỚC 2: Tạo package gửi đi
────────────────────────────────────────────────────────────

cd backend
./prepare-for-deploy.sh

Output:
  ✓ xdynamic-backend-20251204-xxxxx.tar.gz  (~ 10MB)
  ✓ SEND_TO_DEPLOY.txt


GỬI 2 FILES CHO BẠN DEPLOY
────────────────────────────────────────────────────────────

Files ở: /home/tuanphan/.../xdynamic-extension/

  [1] xdynamic-backend-20251204-xxxxx.tar.gz
  [2] SEND_TO_DEPLOY.txt


═══════════════════════════════════════════════════════════════

🚀 BẠN DEPLOY CHỈ CẦN (3 LỆNH)
═══════════════════════════════════════════════════════════════

1. Giải nén:
   tar -xzf xdynamic-backend-*.tar.gz && cd backend

2. Config:
   cp .env.production .env

3. Deploy:
   ./deploy.sh

DONE! API chạy tại: http://localhost:8000


═══════════════════════════════════════════════════════════════

📁 CẤU TRÚC FILES ĐÃ TẠO
═══════════════════════════════════════════════════════════════

backend/
├── Dockerfile                    ← Docker build config
├── requirements.txt              ← Python dependencies
├── mobilenetv2_*.pth            ← ML model (8.8MB)
├── .env.production              ← Production config
├── deploy.sh                    ← Auto deploy script
├── prepare-for-deploy.sh        ← Package creator
├── docker-compose.prod.yaml     ← Docker compose
├── DEPLOYMENT_GUIDE.md          ← Full guide
└── app/                         ← Source code


═══════════════════════════════════════════════════════════════

✅ CHECKLIST
═══════════════════════════════════════════════════════════════

Trước khi gửi:
  [ ] .env.production đã sửa APP_URL
  [ ] JWT_SECRET_KEY đã thay đổi
  [ ] DEBUG=false
  [ ] Chạy ./prepare-for-deploy.sh thành công
  [ ] File .tar.gz được tạo


═══════════════════════════════════════════════════════════════

📚 TÀI LIỆU THAM KHẢO
═══════════════════════════════════════════════════════════════

BACKEND_DEPLOY_SIMPLE_GUIDE.md   - Hướng dẫn đơn giản
DEPLOYMENT_GUIDE.md              - Hướng dẫn đầy đủ (trong archive)
BACKEND_DEPLOY_QUICK_GUIDE.txt   - Quick reference


═══════════════════════════════════════════════════════════════

🔧 DEBUG
═══════════════════════════════════════════════════════════════

Nếu prepare-for-deploy.sh lỗi:
  chmod +x prepare-for-deploy.sh

Nếu thiếu file model:
  ls -lh mobilenetv2_dangerous_objects.pth

Test build local:
  docker build -t test-api .


═══════════════════════════════════════════════════════════════

🌐 SAU KHI DEPLOY
═══════════════════════════════════════════════════════════════

Kiểm tra:
  curl https://app.xdynamic.cloud/health
  # Response: {"status":"ok"}

Update extension .env.production:
  VITE_API_BASE_URL=https://app.xdynamic.cloud

Rebuild extension:
  cd frontend/extension
  npm run zip


═══════════════════════════════════════════════════════════════

Build: 2025-12-04
Version: 1.0.0
Ready to deploy!

