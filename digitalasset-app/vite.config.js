import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: {},
    "process.env": {},
  },
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      include: ["buffer", "crypto"],
    }),
  ],
  resolve: {
    alias: {
      buffer: "buffer/",
      process: "process/browser",
    },
  },
});
