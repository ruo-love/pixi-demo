import { defineConfig } from "vite";
import { assetpackPlugin } from "./scripts/assetpack-vite-plugin";
import path from "path";

export default defineConfig({
  root: "./",
  base: "./",
  plugins: [
    assetpackPlugin(),
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