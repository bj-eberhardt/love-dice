import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import { imagetools } from "vite-imagetools";

const packageJson = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8")) as {
  version: string;
};

const isNodeModule = (id: string) => /node_modules[\\/]/.test(id);

export default defineConfig({
  plugins: [react(), imagetools()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version)
  },
  publicDir: "public",
  build: {
    manifest: true,
    outDir: "dist/client",
    copyPublicDir: true,
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "three",
              test: (id) =>
                isNodeModule(id) && id.includes("three/") && !id.includes("@react-three"),
              priority: 20
            }
          ]
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
