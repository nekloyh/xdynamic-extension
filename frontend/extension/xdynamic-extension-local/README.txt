# XDynamic Extension - Distribution Package

This folder contains the built XDynamic Extension ready for installation.

## 📦 Contents

- All extension files compiled and ready to load in Chrome/Edge
- Background scripts for ML detection
- Content scripts for page scanning
- Popup UI and dashboard
- Pre-configured to connect to: **https://app.xdynamic.cloud**

## 🔧 Installation Instructions

### Step 1: Open Extensions Page

Open Chrome or Edge browser and navigate to:
- **Chrome**: `chrome://extensions/`
- **Edge**: `edge://extensions/`

### Step 2: Enable Developer Mode

Toggle the "Developer mode" switch in the top-right corner.

### Step 3: Load Extension

1. Click the **"Load unpacked"** button
2. Select this folder (the one containing this README)
3. The extension will be installed immediately

### Step 4: Done!

You should see the XDynamic Extension icon in your browser toolbar.
Click it to:
- Login or use Free plan
- Scan pages for dangerous/NSFW content
- Configure filter settings
- View statistics

## 🌐 Backend Connection

This extension is pre-configured to connect to:
```
https://app.xdynamic.cloud
```

No additional configuration needed!

## 🆘 Troubleshooting

### Extension won't load
- Make sure you selected the correct folder
- Check that all files are present
- Try reloading the extension

### Can't connect to backend
- Check your internet connection
- Verify the backend is running at https://app.xdynamic.cloud
- Try logging in again

### Extension shows errors
- Right-click the extension icon → "Inspect popup" to see errors
- Check browser console for error messages
- Make sure you're using Chrome/Edge (not Firefox)

## 📧 Support

For issues or questions, contact the development team.

## 🔄 Updates

To update the extension:
1. Download the new version
2. In `chrome://extensions/`, click the refresh icon on the extension card
3. Or remove and reinstall with the new version

---

**Version**: 1.0.0  
**Build Date**: 2025-12-04
