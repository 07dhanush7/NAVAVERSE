import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@/components": fileURLToPath(new URL("./src/Components", import.meta.url)),
      "@/lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  server: {
    host: "localhost",
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
            return "vendor-react";
          }
          if (id.includes("framer-motion") || id.includes("motion")) {
            return "vendor-motion";
          }
          if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("canvg")) {
            return "vendor-export";
          }
          if (id.includes("quill")) {
            return "vendor-editor";
          }
          return "vendor";
        },
      },
    },
  },
});
