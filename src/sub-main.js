import { Spine,SpineDebugRenderer } from "@esotericsoftware/spine-pixi-v7";
import * as PIXI from "pixi.js"
// import { Spine, SpineDebugRenderer } from '@pixi-spine/all-3.8' // Do this once at the very start of your code. This registers the loader!

window.onload = async function () {
  const app = new PIXI.Application({
    backgroundColor: "#fff",
    resizeTo: window
  });
  const root = document.getElementById("pixi-container");
  root.appendChild(app.view);
  //初始化世界
  const world = new PIXI.Container();
  app.stage.addChild(world)
  //初始化背景
  const bg = await loadBg()
  world.addChild(bg);
  //加载spine动画
  const tree = await loadSpine()
  tree.interactive = true;  // 开启交互
  tree.cursor = "pointer"
  tree.on('pointertap', (event) => {
    console.log('tree',event);
    tree.state.setAnimation(0,"shake",false)
    tree.state.setAnimation(0,"fall_01",false)
  })
  

  world.addChild(tree);
  tree.on("click", (e) => {
    console.log(e);
  });

  window.addEventListener("resize", updateUi);
  updateUi()
  loadWords()
  debug()
  function updateUi() {
    bg.width = app.screen.width
    bg.height = app.screen.height
    tree.x = app.screen.width / 2;
    tree.y = app.screen.height * 0.5; // 稍微向上一点
  }
  function debug(){
    tree.debug = new SpineDebugRenderer()
    tree.debug.drawDebug = true; 
    tree.debug.drawMeshHull = true;
    tree.debug.drawMeshTriangles = true;
    tree.debug.drawBones = true;
    tree.debug.drawPaths = true;
    tree.debug.drawBoundingBoxes = true;
    tree.debug.drawClipping = true;
    tree.debug.drawRegionAttachments = true;
  }
  function loadWords() {
    const data = [
      { value: "A", slot: "tree0006", animation: "fall_01" },
      { value: "B", slot: "tree0007", animation: "fall_01" },
      { value: "C", slot: "tree0019", animation: "fall_03" },
      { value: "D", slot: "tree0021", animation: "fall_04" }
    ];
    for (let i = 0; i < data.length; i++) {
      const word = data[i];
      const label = new PIXI.Text(word.value, {
        fill: 0x000000,
        fontSize: 24,
      });
      label.anchor.set(0.5);
      world.addChild(label);

      const slot = tree.skeleton.findSlot(word.slot);
      if (!slot) continue;
      tree.addSlotObject(word.slot, label);
    }
    // // 每帧更新位置
    // app.ticker.add(() => {
    //   for (let i = 0; i < labels.length; i++) {
    //     const { label, slot } = labels[i];
    //     const bone = slot.bone;
    //     const OFFSET_Y = 0; // 需要微调的话加这里
    //     label.x = tree.x + bone.worldX * tree.scale.x;
    //     label.y = tree.y + (bone.worldY + OFFSET_Y) * tree.scale.y;
    //   }
    // });
  }
  async function loadBg() {
    const bg = PIXI.Sprite.from('/tree/bg.png')
    return bg
  }
  async function loadSpine() {
    // const resource = await PIXI.Assets.load('/tree/tree.json');
    // const tree = new Spine(resource.spineData);
    await PIXI.Assets.load([
      '/tree/tree.json',
      '/tree/tree.atlas',
      '/tree/tree.png'
    ]);
    const tree = Spine.from({
      skeleton: '/tree/tree.json',
      atlas: '/tree/tree.atlas',
      scale: 0.5
    });
    return tree
  }

}



