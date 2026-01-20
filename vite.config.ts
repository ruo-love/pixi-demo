import { defineConfig } from "vite";
import { assetpackPlugin } from "./scripts/assetpack-vite-plugin";
import path from "path";
import legacy from "@vitejs/plugin-legacy"
export default defineConfig({
  root: "./",
  base: "./",
  plugins: [
    assetpackPlugin(),
    legacy({
            targets: [
                "last 2 versions",
                "iOS >= 10",
                "Android >= 6",
                "Chrome >= 49",
                "Safari >= 10",
                "Samsung >= 5",
                "OperaMobile >= 46",
                // 其他特定版本或者范围
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