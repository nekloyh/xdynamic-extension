import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { crx } from "@crxjs/vite-plugin";
import { copyFileSync } from "fs";
import manifest from "./manifest";

export default defineConfig({
  plugins: [
    react(), 
    crx({ manifest }),
    // Copy installation instructions to dist after build
    {
      name: 'copy-install-readme',
      closeBundle() {
        try {
          copyFileSync('INSTALL_README.txt', 'dist/README.txt');
          console.log('✓ Copied installation instructions to dist/');
        } catch (err) {
          console.warn('Could not copy README:', err);
        }
      }
    }
  ],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: process.env.NODE_ENV === "development",

    rollupOptions: {
      input: {
        // Additional pages that aren't handled by manifest
        onboarding: resolve(__dirname, "src/onboarding/index.html"),
        report: resolve(__dirname, "src/report/index.html"),
        login: resolve(__dirname, "src/login/index.html"),
        payment: resolve(__dirname, "src/payment/index.html"),
        plan: resolve(__dirname, "src/plan/index.html"),
      },
    },
  },

  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },

  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5174,
    },
  },

  // Load environment variables based on NODE_ENV or custom env
  envPrefix: 'VITE_',
});
