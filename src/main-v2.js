
import * as PIXI from "pixi.js"
import {Spine}from'@pixi-spine/all-3.8';
window.onload = async function () {
  const app = new PIXI.Application({
    backgroundColor: "#fff",
    resizeTo: window
  });
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  const root = document.getElementById("pixi-container");
  root.appendChild(app.view);
  //初始化世界
  const world = new PIXI.Container();
  world.eventMode = "static";
  app.stage.addChild(world)

  PIXI.Assets.load("./tree/tree.json").then((res) => {
    const tree = new Spine(res.spineData);
    tree.alpha = 1;
    tree.eventMode = "static";  // 开启交互
    tree.cursor = "pointer"
    tree.x = app.screen.width / 2;
    tree.y = app.screen.height * 0.6;
    tree.on("pointerdown",()=>{
      tree.state.setAnimation(0, "shake", false)
    })
    world.addChild(tree);
  });
}
