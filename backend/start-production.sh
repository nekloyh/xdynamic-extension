#!/bin/bash

# ===================================
# Build & Deploy - Production
# ===================================

set -e
cd "$(dirname "$0")"

echo "🚀 Starting XDynamic Backend (Production)"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt"
    exit 1
fi

# Check required files
if [ ! -f ".env.production" ]; then
    echo "❌ Missing .env.production file"
    echo "   Please create .env.production with production settings"
    exit 1
fi

if [ ! -f "mobilenetv2_dangerous_objects.pth" ]; then
    echo "❌ Missing model file: mobilenetv2_dangerous_objects.pth"
    exit 1
fi

echo "✅ All requirements met"
echo ""

# Build and run with production profile
echo "🔨 Building and starting containers (with Nginx)..."
docker compose --env-file .env.production --profile production up -d --build

echo ""
echo "✅ Production deployment started..."
echo ""
echo "📊 Container status:"
docker compose --profile production ps
echo ""
echo "📌 Endpoints:"
echo "   HTTP:   http://app.xdynamic.cloud"
echo "   HTTPS:  https://app.xdynamic.cloud"
echo "   Health: https://app.xdynamic.cloud/health"
echo "   API:    https://app.xdynamic.cloud/api"
echo ""
echo "📝 Useful commands:"
echo "   Logs:    docker compose --profile production logs -f"
echo "   Stop:    docker compose --profile production down"
echo "   Restart: docker compose --profile production restart"
echo ""
echo "⚠️  Don't forget to:"
echo "   - Configure SSL certificates in /etc/letsencrypt"
echo "   - Update nginx config for your domain"
echo "   - Set strong JWT_SECRET_KEY in .env.production"
echo ""
