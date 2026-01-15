// vite.config.mts
import type { AssetPackConfig } from "@assetpack/core";
import { AssetPack } from "@assetpack/core";
import { pixiPipes } from "@assetpack/core/pixi";
import path from "path";
import type { Plugin, ResolvedConfig } from "vite";

export function assetpackPlugin() {
  const apConfig = {
    entry: "./raw-assets",
    pipes: [
      ...pixiPipes({
        cacheBust: false,
        manifest: {
          output: "./src/manifest.json",
        },
      }),
    ],
  } as AssetPackConfig;
  let mode: ResolvedConfig["command"];
  let ap: AssetPack | undefined;

  return {
    name: "vite-plugin-assetpack",
    configResolved(resolvedConfig) {
      mode = resolvedConfig.command;
      if (apConfig.output) return;
      const publicDir = resolvedConfig.publicDir || "public";
      const publicDirPath = path.isAbsolute(publicDir)
        ? publicDir
        : path.resolve(resolvedConfig.root ?? process.cwd(), publicDir);
      apConfig.output = path.join(publicDirPath, "assets");
    },
    buildStart: async () => {
      if (mode === "serve") {
        if (ap) return;
        ap = new AssetPack(apConfig);
        await ap.watch();
      } else {
        await new AssetPack(apConfig).run();
      }
    },
    buildEnd: async () => {
      if (ap) {
        await ap.stop();
        ap = undefined;
      }
    },
  } as Plugin;
}
