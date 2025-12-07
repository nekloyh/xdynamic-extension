#!/bin/bash

# ===================================
# Build & Run - Development (Local)
# ===================================

set -e
cd "$(dirname "$0")"

echo "🚀 Starting XDynamic Backend (Development)"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt"
    exit 1
fi

# Check required files
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
    else
        echo "❌ Missing .env file"
        exit 1
    fi
fi

if [ ! -f "mobilenetv2_dangerous_objects.pth" ]; then
    echo "❌ Missing model file: mobilenetv2_dangerous_objects.pth"
    exit 1
fi

echo "✅ All requirements met"
echo ""

# Build and run
echo "🔨 Building and starting containers..."
docker compose up -d --build

echo ""
echo "✅ Backend is starting..."
echo ""
echo "📊 Container status:"
docker compose ps
echo ""
echo "📌 Endpoints:"
echo "   API:    http://localhost:8000"
echo "   Health: http://localhost:8000/health"
echo "   Docs:   http://localhost:8000/docs"
echo ""
echo "📝 Useful commands:"
echo "   Logs:    docker compose logs -f backend"
echo "   Stop:    docker compose down"
echo "   Restart: docker compose restart backend"
echo ""
