import * as PIXI from "pixi.js"
import {Spine} from '@pixi-spine/all-3.8' // Do this once at the very start of your code. This registers the loader!

window.onload = async function () {
  const app = new PIXI.Application();
  const root = document.getElementById("pixi-container");
  root.appendChild(app.view);

  try {
    const resource = await PIXI.Assets.load('/tree/tree.json');
    console.log("加载成功:", resource);

    // 3. 创建 Spine 实例
    // 在 UMD 版本中，Spine 通常挂载在 PIXI.spine.Spine
    const tree = new Spine(resource.spineData);

    // 设置位置
    tree.x = app.screen.width / 4+100;
    tree.y = 400; // 稍微向上一点
    tree.scale.set(.5);

    // 4. 播放动画
    if (tree.state.hasAnimation('animation')) {
      tree.state.setAnimation(0, 'animation', true);
    }

    app.stage.addChild(tree);

    // 5. 交互逻辑 (v7 建议开启 eventMode)
    app.stage.eventMode = 'static';
    app.stage.on('pointerdown', () => {
      console.log("Clicked!");
      tree.state.setAnimation(0, 'animation', true);
    });

  } catch (error) {
    console.error("资源加载失败:", error);
  }
}