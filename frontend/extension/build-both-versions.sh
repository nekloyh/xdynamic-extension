#!/bin/bash

# ===================================
# Build XDynamic Extension - Both Versions
# ===================================
# Creates 2 zip files:
#   1. xdynamic-extension-local.zip    (for local testing)
#   2. xdynamic-extension-production.zip (for production use)

set -e

cd "$(dirname "$0")"

echo "🚀 Building XDynamic Extension - Both Versions"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
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
rm -rf dist/
rm -f xdynamic-extension-local.zip
rm -f xdynamic-extension-production.zip
echo ""

# ===================================
# Build 1: LOCAL VERSION
# ===================================
echo "📦 Building LOCAL version..."
echo "   API: http://localhost:8000"
echo ""

# Copy local env
cp .env.local .env

# Build với mode development để đọc .env đúng
npm run build -- --mode development

# Create zip for local
if [ -d "dist" ]; then
    cd dist
    zip -r ../xdynamic-extension-local.zip . -q
    cd ..
    echo "✅ Created: xdynamic-extension-local.zip"
    ls -lh xdynamic-extension-local.zip
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo ""

# Clean for next build
rm -rf dist/

# ===================================
# Build 2: PRODUCTION VERSION
# ===================================
echo "📦 Building PRODUCTION version..."
echo "   API: https://app.xdynamic.cloud"
echo ""

# Copy production env
cp .env.production .env

# Build với mode production
npm run build -- --mode production

# Create zip for production
if [ -d "dist" ]; then
    cd dist
    zip -r ../xdynamic-extension-production.zip . -q
    cd ..
    echo "✅ Created: xdynamic-extension-production.zip"
    ls -lh xdynamic-extension-production.zip
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo ""
echo "✨ Build completed successfully!"
echo ""
echo "📦 Files created:"
echo "   1. xdynamic-extension-local.zip       (for local development)"
echo "   2. xdynamic-extension-production.zip  (for production users)"
echo ""
echo "📝 Next steps:"
echo ""
echo "Local Testing:"
echo "   1. Open Chrome -> chrome://extensions/"
echo "   2. Enable 'Developer mode'"
echo "   3. Click 'Load unpacked'"
echo "   4. Extract and select xdynamic-extension-local.zip"
echo "   5. Make sure backend is running at http://localhost:8000"
echo ""
echo "Production:"
echo "   1. Distribute xdynamic-extension-production.zip to users"
echo "   2. Make sure backend is deployed at https://app.xdynamic.cloud"
echo ""
cat .env
echo ""

# Build
echo "  Building extension..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Build failed - dist folder not found!${NC}"
    exit 1
fi

# Create zip for production
echo "  Creating zip file..."
cd dist
zip -r ../xdynamic-extension-production.zip . -q
cd ..

echo -e "${GREEN}✓ Production version built successfully!${NC}"
echo "  Output: xdynamic-extension-production.zip"
echo ""

# ============================================================================
# Create README for users
# ============================================================================
cat > EXTENSION_DOWNLOAD_README.txt << 'README_EOF'
╔════════════════════════════════════════════════════════════════════════╗
║          XDYNAMIC CHROME EXTENSION - INSTALLATION GUIDE                ║
╚════════════════════════════════════════════════════════════════════════╝

📦 PACKAGE CONTENTS
────────────────────────────────────────────────────────────────────────

You have 2 versions of the extension:

1️⃣ xdynamic-extension-development.zip
   • For LOCAL TESTING only
   • Connects to: http://localhost:8000
   • Use this if you're running the backend locally

2️⃣ xdynamic-extension-production.zip
   • For PRODUCTION use
   • Connects to: https://app.xdynamic.cloud
   • Use this for the live application


🚀 INSTALLATION INSTRUCTIONS
────────────────────────────────────────────────────────────────────────

Step 1: Choose the correct version
   • Development → For local testing
   • Production → For live use

Step 2: Extract the ZIP file
   • Unzip to a folder on your computer
   • Example: C:\xdynamic-extension\ or ~/xdynamic-extension/

Step 3: Open Chrome Extensions
   • Open Google Chrome
   • Go to: chrome://extensions/
   • Or: Menu → More Tools → Extensions

Step 4: Enable Developer Mode
   • Toggle "Developer mode" ON (top-right corner)

Step 5: Load the Extension
   • Click "Load unpacked"
   • Select the folder where you extracted the ZIP
   • The extension should now appear in your extensions list

Step 6: Verify Installation
   • You should see the XDynamic icon in your Chrome toolbar
   • Click the icon to open the extension
   • Sign in with Google to start using


🔧 TROUBLESHOOTING
────────────────────────────────────────────────────────────────────────

Extension not loading:
  → Make sure you selected the correct folder (containing manifest.json)
  → Check that Developer mode is enabled

Can't connect to server:
  → Development version: Make sure backend is running at localhost:8000
  → Production version: Check internet connection

Extension disappeared after Chrome restart:
  → This is normal for unpacked extensions
  → Keep the extension folder and don't delete it
  → Chrome will reload it automatically


📝 NOTES
────────────────────────────────────────────────────────────────────────

• Development version is NOT for regular users
• Production version connects to the live server
• You need a Google account to sign in
• Extension requires internet connection for API calls


🆘 SUPPORT
────────────────────────────────────────────────────────────────────────

For issues or questions:
• Check backend status: https://app.xdynamic.cloud/api/health
• Review extension console: Right-click extension → Inspect
• Contact support team


════════════════════════════════════════════════════════════════════════

Thank you for using XDynamic! 🎉

════════════════════════════════════════════════════════════════════════
README_EOF

# ============================================================================
# Restore development .env
# ============================================================================
cp .env.development .env

# ============================================================================
# Summary
# ============================================================================
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILD COMPLETED SUCCESSFULLY!                              ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 Output Files:"
echo ""
echo -e "  ${GREEN}1. xdynamic-extension-development.zip${NC}"
echo "     → For LOCAL TESTING (localhost:8000)"
echo "     → Backend: http://localhost:8000"
echo "     → Admin: http://localhost:5173"
DEV_SIZE=$(ls -lh xdynamic-extension-development.zip | awk '{print $5}')
echo "     → Size: $DEV_SIZE"
echo ""
echo -e "  ${GREEN}2. xdynamic-extension-production.zip${NC}"
echo "     → For PRODUCTION (app.xdynamic.cloud)"
echo "     → Backend: https://app.xdynamic.cloud/api"
echo "     → Admin: https://app.xdynamic.cloud/admin"
PROD_SIZE=$(ls -lh xdynamic-extension-production.zip | awk '{print $5}')
echo "     → Size: $PROD_SIZE"
echo ""
echo -e "  ${BLUE}3. EXTENSION_DOWNLOAD_README.txt${NC}"
echo "     → Installation instructions for users"
echo ""
echo "📍 Location: $EXTENSION_DIR"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "  1. For local testing:"
echo "     • Start backend: cd backend && docker compose up -d"
echo "     • Load: xdynamic-extension-development.zip"
echo ""
echo "  2. For production deployment:"
echo "     • Share: xdynamic-extension-production.zip with users"
echo "     • Include: EXTENSION_DOWNLOAD_README.txt"
echo ""
echo "  3. Installation guide:"
echo "     • Extract ZIP file"
echo "     • Chrome → chrome://extensions/"
echo "     • Enable Developer mode"
echo "     • Load unpacked → Select extracted folder"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo ""
