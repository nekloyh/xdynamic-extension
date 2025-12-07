#!/bin/bash

# ===================================
# Build Admin Dashboard - Both Versions
# ===================================
# Creates 2 dist folders:
#   1. dist-local/      (for local development)
#   2. dist-production/ (for production deployment)

set -e

cd "$(dirname "$0")"

echo "🚀 Building Admin Dashboard - Both Versions"
echo ""

# Check Node.js
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt"
    exit 1
fi

echo "✅ npm: $(npm --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist dist-local dist-production
echo ""

# ===================================
# Build 1: LOCAL VERSION
# ===================================
echo "📦 Building LOCAL version..."
echo "   API: http://localhost:8000"
echo ""

# Build with development env
npm run build -- --mode development

# Rename dist to dist-local
if [ -d "dist" ]; then
    mv dist dist-local
    echo "✅ Created: dist-local/"
    du -sh dist-local/
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo ""

# ===================================
# Build 2: PRODUCTION VERSION
# ===================================
echo "📦 Building PRODUCTION version..."
echo "   API: https://app.xdynamic.cloud"
echo ""

# Build with production env
npm run build -- --mode production

# Rename dist to dist-production
if [ -d "dist" ]; then
    mv dist dist-production
    echo "✅ Created: dist-production/"
    du -sh dist-production/
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

# Also keep a copy as 'dist' for convenience
cp -r dist-production dist

echo ""
echo "✨ Build completed successfully!"
echo ""
echo "📦 Folders created:"
echo "   1. dist-local/       (for local: http://localhost:8000)"
echo "   2. dist-production/  (for production: https://app.xdynamic.cloud)"
echo "   3. dist/             (copy of production)"
echo ""
echo "📝 Next steps:"
echo ""
echo "Local Testing:"
echo "   cd dist-local"
echo "   python3 -m http.server 5173"
echo "   Open: http://localhost:5173"
echo ""
echo "Production Deployment:"
echo "   1. Upload dist-production/ to server"
echo "   2. Configure nginx to serve from dist-production/"
echo "   3. Or use in docker-compose.yaml nginx volume"
echo ""
