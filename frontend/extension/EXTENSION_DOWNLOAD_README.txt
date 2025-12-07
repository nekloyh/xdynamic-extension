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
