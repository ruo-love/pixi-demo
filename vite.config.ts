import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import { visualizer } from "rollup-plugin-visualizer";
import { assetpackPlugin } from "./scripts/assetpack-vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用压缩和优化
    minify: "terser",
    terserOptions: {
      compress: {
        // 移除console.log
        drop_console: true,
        // 移除debugger
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Pixi.js 核心库 - 最大的依赖，单独分chunk
          pixi: ["pixi.js"],

          // Pixi.js 相关库分组
          "pixi-ui": ["@pixi/ui", "@pixi/layout"],
          "pixi-sound": ["@pixi/sound"],
          "pixi-spine": ["@esotericsoftware/spine-pixi-v8"],

          // 动画库
          gsap: ["gsap"],
          motion: ["motion"],

          // 工具库分组（包含较小的第三方库）
          utils: [
            "eventemitter3",
            "ismobilejs",
            "earcut",
            "tiny-lru",
            "parse-svg-path",
            "@pixi/colord",
          ],

          // UI相关的小型库
          "ui-helpers": ["yoga-layout", "typed-signals", "tweedle.js"],

          // 动画工具库
          "motion-utils": ["motion-utils", "motion-dom"],
        },
        // 优化chunk文件名
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === "pixi") {
            return "assets/pixi-[hash].js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
  plugins: [
    assetpackPlugin(),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
    // 生成多种格式的打包分析报告
    visualizer({
      filename: "analysis/bundle-treemap.html",
      title: "Bundle Size Treemap - Pixi.js Project",
      template: "treemap",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    visualizer({
      filename: "analysis/bundle-sunburst.html",
      title: "Bundle Size Sunburst - Pixi.js Project",
      template: "sunburst",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    visualizer({
      filename: "analysis/bundle-data.json",
      template: "raw-data",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    port: 8080,
    open: true,
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
});
