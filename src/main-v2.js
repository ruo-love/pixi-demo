
import * as PIXI from "pixi.js-legacy" //pixi-v7
import {Spine}from'@esotericsoftware/spine-pixi-v7'; 
window.onload = async function () {
  const app = new PIXI.Application({
    backgroundColor: "#282a35",
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
  await PIXI.Assets.load([
    './spineboy/spineboy-pro.skel',
    './spineboy/spineboy-pma.atlas',
    './spineboy/spineboy-pma.png',
  ]);
  const spine = Spine.from({
      skeleton: './spineboy/spineboy-pro.skel',
      atlas: './spineboy/spineboy-pma.atlas',
      scale:0.6
  });
  spine.x=app.screen.width/2
  spine.y=app.screen.height/2+100
  spine.state.setAnimation(0,"walk",true)

  const text = new PIXI.Text("测试文本兼容性",{
    fill:"#fff"
  })
  text.x = spine.x -text.width/2
  text.y = spine.y +20
  world.addChild(spine,text)
}
