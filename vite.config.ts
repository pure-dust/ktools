import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {resolve} from "path"

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  clearScreen: false,
  resolve: {
    alias: {
      "~novel": resolve(__dirname, "windows/main"),
      "~setting": resolve(__dirname, "windows/setting"),
      "~components": resolve(__dirname, "components"),
      "~utils": resolve(__dirname, "utils"),
      "~assets": resolve(__dirname, "assets"),
      "~styles": resolve(__dirname, "styles")
    }
  },
  server: {
    port: 52034,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    assetsDir: "public",
    minify: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "windows/novel/index.html"),
        setting: resolve(__dirname, "windows/setting/index.html"),
      }
    }
  }
}));
