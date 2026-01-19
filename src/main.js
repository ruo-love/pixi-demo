import * as PIXI from "pixi.js"
import { Spine, SpineDebugRenderer } from '@pixi-spine/all-3.8' // Do this once at the very start of your code. This registers the loader!
const questions = [
  { question: "H&ppy", value: "a", slot: "tree0006", animation: "fall_01" },
  { question: "W&rd", value: "o", slot: "tree0007", animation: "fall_01" },
  { question: "Ap&le", value: "p", slot: "tree0019", animation: "fall_03" },
  { question: "An&y", value: "d", slot: "tree0021", animation: "fall_04" }
]
window.onload = async function () {
  let dragging = false;
  let dragTarget = null;
  let dragOffset = null;
  let dragBone = null;
  let dragWord = {}
  let dragSlotName = null;
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
  //初始化背景
  const bg = await loadBg()
  world.addChild(bg);
  loadQuestions()
  //加载spine动画
  const tree = await loadSpine()
  tree.eventMode = "static";  // 开启交互
  tree.cursor = "pointer"
  tree.on('pointertap', (event) => {
    if (dragging) return
    tree.state.setAnimationByName(0, "shake", false)
  })
  tree.state.addListener({
    complete: function (entry) {
      if (entry.animation.name === "shake") {
        tree.state.setAnimationByName(0, "fall_01", false)
      }
      if (entry.animation.name === "fall_01") {
        tree.state.clearTrack(0);
      }
    }
  });

  world.addChild(tree);
  window.addEventListener("resize", updateUi);
  updateUi()
  debug()
  loadWords()
  function updateUi() {
    bg.width = app.screen.width
    bg.height = app.screen.height
    tree.x = app.screen.width / 2;
    tree.y = app.screen.height * 0.5; // 稍微向上一点
    tree.scale.set(.5);
  }
  function debug() {
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
  function loadQuestions() {
    const cards = [];
    const gap = 40;
    for (let i = 0; i < questions.length; i++) {
      const card = new WordCard(questions[i]);
      cards.push(card);
    }
    const totalWidth = cards.reduce((sum, card) => sum + card.width, 0) + gap * (cards.length - 1);
    let startX = (app.screen.width - totalWidth) / 2;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      card.x = startX;
      card.y = app.screen.height / 2 + 100;
      world.addChild(card);
      startX += card.width + gap;
    }
  }

function loadWords() {
  const data = questions;
  const containers = [];
  for (let i = 0; i < data.length; i++) {
    const word = data[i];
    const container = new PIXI.Container();
    container.eventMode = "static";
    container.interactive = true
    container.cursor = "grab";
    const bg = new PIXI.Graphics();
    bg.drawCircle(0, 0, 35);
    container.addChild(bg);
    bg.hitArea = new PIXI.Circle(0, 0, 35);
    const label = new PIXI.Text(word.value, {
      fill: 0x000000,
      fontSize: 24,
    });
    label.anchor.set(0.5);
    container.addChild(label);
    world.addChild(container);
    const slot = tree.skeleton.findSlot(word.slot);
    enableDrag(container, word);
    if (!slot) continue;
    containers.push({ container, slot });
  }
  app.ticker.add(() => {
    for (let i = 0; i < containers.length; i++) {
      const { container, slot } = containers[i];
      const bone = slot.bone;
      // 只有未拖拽的对象才跟随骨骼
      if (dragging && dragSlotName === slot.data.name) continue
      container.x = tree.x + bone.worldX * tree.scale.x;
      container.y = tree.y + (bone.worldY) * tree.scale.y;
      container.rotation = -bone.rotation * Math.PI / 180;
    }
  });
}
app.stage
  .on("pointermove", (e) => {
    if (!dragging || !dragTarget) return;
    const pos = e.getLocalPosition(world); // world 坐标系
    dragTarget.position.set(pos.x - dragOffset.x, pos.y - dragOffset.y);
    if (dragBone) {
      const spinePos = {
        x: (dragTarget.x - tree.x) / tree.scale.x,
        y: (dragTarget.y - tree.y) / tree.scale.y
      };
      if (dragBone.parent) {
        dragBone.parent.worldToLocal(spinePos);
      }
      dragBone.x = spinePos.x;
      dragBone.y = spinePos.y;
      tree.skeleton.updateWorldTransform();
      tree.update(0);
    }
  })
  .on("pointerup", endDrag)
  .on("pointerupoutside", endDrag);

function enableDrag(container, word) {
  container.eventMode = "static";
  container.cursor = "grab";
  container
    .on("pointerdown", (e) => {
      dragging = true;
      dragTarget = container;
      dragOffset = e.getLocalPosition(container);
      dragBone = tree.skeleton.findSlot(word.slot)?.bone || null;
      dragWord = word
      dragSlotName = word.slot;
      tree.state.clearTrack(0);
      container.cursor = "grabbing";
      console.log("pointerdown")
    });
}

function endDrag() {
  if (!dragTarget) return;
  dragging = false;
  dragTarget.cursor = "grab";
  dragTarget = null;
  dragOffset = null;
  dragBone = null;
  dragWord = {}
  dragSlotName = null;
  console.log("endDrag")
}

async function loadBg() {
  const bg = PIXI.Sprite.from('/tree/bg.png')
  return bg
}
async function loadSpine() {
  const resource = await PIXI.Assets.load('/tree/tree.json');
  console.log('resource', resource)
  const tree = new Spine(resource.spineData);
  return tree
}
}
class WordCard extends PIXI.Container {
  constructor(question) {
    super()
    this.card = new PIXI.Container();
    this.addChild(this.card);
    const cardWidth = 300;
    const cardHeight = 100;
    // 背景
    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0xc0f0f8); // 卡片背景颜色
    this.bg.drawRoundedRect(0, 0, cardWidth, cardHeight, 10); // 宽300高100，圆角15
    this.bg.endFill();
    this.card.addChild(this.bg);
    const word = question.question;
    const highlightIndex = word.split("").findIndex(e => {
      return e == "&"
    });
    this.textContainer = new PIXI.Container();
    this.textContainer.y = cardHeight / 2; // 卡片垂直中心
    this.textContainer.pivot.y = 0.5;
    this.card.addChild(this.textContainer);
    let offsetX = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const text = new PIXI.Text(char, {
        fill: i === highlightIndex ? 0x4da6ff : 0x000000, // 高亮字母蓝色
        fontSize: 28,
        fontWeight: "bold",
      });
      text.anchor.set(0, 0.5);
      text.x = offsetX;
      text.y = 0;
      this.textContainer.addChild(text);
      offsetX += text.width; // 下一个字母 x 位置
    }
    this.textContainer.x = (cardWidth - offsetX) / 2;
  }
  updateAnswer(word){

  }
}
