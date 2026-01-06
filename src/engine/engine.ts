import { sound } from "@pixi/sound";
import "@pixi/layout";
import type {
  ApplicationOptions,
  DestroyOptions,
  RendererDestroyOptions,
} from "pixi.js";
import { Application, Assets, extensions, ResizePlugin } from "pixi.js";
import "pixi.js/app";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - This is a dynamically generated file by AssetPack
import manifest from "../manifest.json";

import { CreationAudioPlugin } from "./audio/AudioPlugin";
import { CreationNavigationPlugin } from "./navigation/NavigationPlugin";
import { CreationResizePlugin } from "./resize/ResizePlugin";
import { getResolution } from "./utils/getResolution";

extensions.remove(ResizePlugin);
extensions.add(CreationResizePlugin);
extensions.add(CreationAudioPlugin);
extensions.add(CreationNavigationPlugin);

/**
 * The main creation engine class.
 *
 * This is a lightweight wrapper around the PixiJS Application class.
 * It provides a few additional features such as:
 * - Navigation manager
 * - Audio manager
 * - Resize handling
 * - Visibility change handling (pause/resume sounds)
 *
 * It also initializes the PixiJS application and loads any assets in the `preload` bundle.
 */
export class CreationEngine extends Application {
  /** Initialize the application */
  public async init(opts: Partial<ApplicationOptions>): Promise<void> {
    opts.resizeTo ??= window; //resizeTo 属性指定了一个参照物。当这个参照物的大小发生改变时，PixiJS 会自动调整内部渲染器的宽度和高度。
    opts.resolution ??= getResolution(); //设定渲染dpi

    await super.init(opts); //初始化pixi Application

    // Append the application canvas to the document body
    document.getElementById("pixi-container")!.appendChild(this.canvas);//渲染画布内容到root dom中
    // Add a visibility listener, so the app can pause sounds and screens
    document.addEventListener("visibilitychange", this.visibilityChange);

    // Init PixiJS assets with this asset manifest
    await Assets.init({ manifest, basePath: "assets" }); //初始化资源模块清单
    await Assets.loadBundle("preload");//立即下载preload模块下的资源，加载完成前 阻塞后续代码执行

    // List all existing bundles names
    const allBundles = manifest.bundles.map((item) => item.name);
    // Start up background loading of all bundles
    Assets.backgroundLoadBundle(allBundles); // 非阻塞式 后台加载资源模块
  }

  public override destroy(
    rendererDestroyOptions: RendererDestroyOptions = false,
    options: DestroyOptions = false,
  ): void {
    document.removeEventListener("visibilitychange", this.visibilityChange);
    super.destroy(rendererDestroyOptions, options);
  }

  /** Fire when document visibility changes - lose or regain focus */
  protected visibilityChange = () => { //性能优化措施
    if (document.hidden) {
      sound.pauseAll(); //停止播放所有音频
      this.navigation.blur(); //画布失去焦点
    } else {
      sound.resumeAll(); //重启所有音频
      this.navigation.focus(); //应用恢复焦点，保障用户在画布中重新进入可交互状态
    }
  };
}
