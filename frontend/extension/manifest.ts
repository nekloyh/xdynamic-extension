import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "XDynamic Extension",
  version: "0.0.1",
  description:
    "An extension for NSFW content detection and filtering for safer browsing",

  permissions: [
    "activeTab", 
    "storage", 
    "scripting", 
    "tabs",
    "contextMenus",
    "webRequest",  // For intercepting image requests
  ],

  host_permissions: [
    "https://*/*", 
    "http://*/*",
    "http://localhost:8000/*",  // Local backend API
  ],

  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },

  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_idle",
      all_frames: false
    },
  ],

  action: {
    default_popup: "src/popup/index.html",
    default_title: "XDynamic Extension",
    default_icon: {
      "32": "icons/default_icon-32.png",
      "64": "icons/default_icon-64.png",
    },
  },

  icons: {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png",
  },

  options_ui: {
    page: "src/dashboard/index.html",
    open_in_tab: true,
  },

  web_accessible_resources: [
    {
      resources: [
        "icons/*.png",
        "assets/*.css",
        "assets/*.js",
        "src/plan/index.html",
        "src/settings/index.html",
        "src/dashboard/index.html",
        "src/payment/index.html",
        "src/report/index.html",
        "src/onboarding/index.html",
        "src/login/index.html",
      ],
      matches: ["<all_urls>"],
    },
  ],
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; style-src 'self' 'unsafe-inline';",
  },
});
