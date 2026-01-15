import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy"
import { assetpackPlugin } from "./scripts/assetpack-vite-plugin";
import injectVcVitePlugin from "inject-vc-vite-plugin";
import path from "path";

export default defineConfig({
  root: "./",
  base: "./",
  plugins: [
    assetpackPlugin(),
    injectVcVitePlugin(),
    legacy({
      targets: [
        "last 2 versions",
        "iOS >= 10", // 完美契合你对旧版 iOS 的兼容需求
        "Android >= 6",
        "Chrome >= 49",
        "Safari >= 10",
      ],
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 8080,
    open: true,
  },
  
  build: {
    minify: 'terser', 
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  }
});