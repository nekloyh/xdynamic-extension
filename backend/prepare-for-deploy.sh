#!/bin/bash

# Script chuẩn bị backend để gửi cho người deploy
# Chạy: ./prepare-for-deploy.sh

set -e

echo "📦 Preparing Backend for Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in backend directory
if [ ! -f "Dockerfile" ]; then
    echo "❌ Please run this script from backend/ directory"
    exit 1
fi

# Step 1: Check .env.production
echo -e "${BLUE}[1/4]${NC} Checking .env.production..."
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found!${NC}"
    echo "Creating from .env.example..."
    cp .env.example .env.production
    echo -e "${YELLOW}⚠️  Please edit .env.production before sending to deploy team!${NC}"
    echo ""
    echo "Important settings to change:"
    echo "  - APP_URL=https://app.xdynamic.cloud/fe"
    echo "  - DEBUG=false"
    echo "  - JWT_SECRET_KEY=<generate new>"
    echo "  - GOOGLE_REDIRECT_URI=https://app.xdynamic.cloud/..."
    echo "  - MOMO_REDIRECT_URL=https://app.xdynamic.cloud/..."
    echo ""
    read -p "Press Enter after editing .env.production..."
fi
echo -e "${GREEN}✓${NC} .env.production found"

# Step 2: Check required files
echo -e "${BLUE}[2/4]${NC} Checking required files..."
REQUIRED_FILES=(
    "Dockerfile"
    "requirements.txt"
    "mobilenetv2_dangerous_objects.pth"
    "deploy.sh"
    "docker-compose.prod.yaml"
    "DEPLOYMENT_GUIDE.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "❌ Missing: $file"
        exit 1
    fi
done

if [ ! -d "app" ]; then
    echo "❌ Missing app/ directory"
    exit 1
fi

echo -e "${GREEN}✓${NC} All required files present"

# Step 3: Create archive
echo -e "${BLUE}[3/4]${NC} Creating deployment package..."

ARCHIVE_NAME="xdynamic-backend-$(date +%Y%m%d-%H%M%S).tar.gz"

tar -czf "../$ARCHIVE_NAME" \
    --exclude="*.pyc" \
    --exclude="__pycache__" \
    --exclude=".venv" \
    --exclude="*.db" \
    --exclude=".env" \
    --exclude="data" \
    --exclude=".git" \
    --exclude="*.log" \
    .

if [ $? -ne 0 ]; then
    echo "❌ Failed to create archive"
    exit 1
fi

echo -e "${GREEN}✓${NC} Archive created: $ARCHIVE_NAME"

# Step 4: Summary
FILE_SIZE=$(du -h "../$ARCHIVE_NAME" | cut -f1)

echo -e "${BLUE}[4/4]${NC} Creating deployment instructions..."

cat > "../SEND_TO_DEPLOY.txt" << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║           XDynamic Backend - Ready for Deployment             ║
╚═══════════════════════════════════════════════════════════════╝

📦 FILE GỬI CHO NGƯỜI DEPLOY
═══════════════════════════════════════════════════════════════

File: xdynamic-backend-YYYYMMDD-HHMMSS.tar.gz

CÁCH DEPLOY NHANH NHẤT (3 bước):
─────────────────────────────────────────────────────────────

1. Upload lên server:
   scp xdynamic-backend-*.tar.gz user@server:/opt/xdynamic/

2. SSH vào server và giải nén:
   ssh user@server
   cd /opt/xdynamic
   tar -xzf xdynamic-backend-*.tar.gz

3. Deploy:
   cp .env.production .env
   ./deploy.sh

Done! API sẽ chạy tại http://localhost:8000


HOẶC DEPLOY THỦ CÔNG:
─────────────────────────────────────────────────────────────

# Build Docker image
docker build -t xdynamic-api:latest .

# Run container
docker run -d \
  --name xdynamic-api \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  xdynamic-api:latest

# Check
curl http://localhost:8000/health


SETUP NGINX REVERSE PROXY:
─────────────────────────────────────────────────────────────

server {
    listen 80;
    server_name app.xdynamic.cloud;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Setup SSL
sudo certbot --nginx -d app.xdynamic.cloud


KIỂM TRA SAU KHI DEPLOY:
─────────────────────────────────────────────────────────────

✓ Health check: curl http://localhost:8000/health
✓ API docs: http://localhost:8000/docs
✓ Logs: docker logs -f xdynamic-api


CHI TIẾT HƯỚNG DẪN:
─────────────────────────────────────────────────────────────

Xem file DEPLOYMENT_GUIDE.md trong archive để biết thêm chi tiết về:
- Troubleshooting
- Monitoring
- Backup & Restore
- Security checklist
- Update procedures


SUPPORT:
─────────────────────────────────────────────────────────────

Nếu gặp vấn đề:
1. Check logs: docker logs xdynamic-api
2. Verify .env file có đúng domain
3. Check port: sudo lsof -i :8000
4. Đọc DEPLOYMENT_GUIDE.md


═══════════════════════════════════════════════════════════════
Build: 2025-12-04
Version: 1.0.0
API Port: 8000
═══════════════════════════════════════════════════════════════
EOF

echo -e "${GREEN}✓${NC} Instructions created: SEND_TO_DEPLOY.txt"
echo ""

# Final summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Ready for Deployment!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📦 Package: ${BLUE}../$ARCHIVE_NAME${NC} (${FILE_SIZE})"
echo -e "📄 Instructions: ${BLUE}../SEND_TO_DEPLOY.txt${NC}"
echo ""
echo -e "📬 Send these files to your deployment team:"
echo -e "   1. ${BLUE}$ARCHIVE_NAME${NC}"
echo -e "   2. ${BLUE}SEND_TO_DEPLOY.txt${NC}"
echo ""
echo -e "🔧 They just need to run:"
echo -e "   ${BLUE}tar -xzf $ARCHIVE_NAME${NC}"
echo -e "   ${BLUE}cp .env.production .env${NC}"
echo -e "   ${BLUE}./deploy.sh${NC}"
echo ""
echo -e "🌐 After deployment, API will be at:"
echo -e "   ${BLUE}https://app.xdynamic.cloud${NC}"
echo ""
