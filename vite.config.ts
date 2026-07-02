import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist/client",
    copyPublicDir: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@react-three/fiber")) return "react-three";
          if (id.includes("three")) return "three";
          if (id.includes("react") || id.includes("react-dom")) return "react-vendor";
        }
      }
    }
  },
  server: {
    port: 5544,
    strictPort: true
  },
  preview: {
    port: 5544,
    strictPort: true
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src")
    }
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
    reporters: ["default", "json"],
    outputFile: "unit-test-results/test-results.json"
  }
});