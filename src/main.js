import * as PIXI from "pixi.js"
import gsap from "gsap"
import { Spine, SpineDebugRenderer } from '@pixi-spine/all-3.8' // Do this once at the very start of your code. This registers the loader!
const questions = [
  { question: "H&ppy", value: "a", slot: "tree0006", animation: "fall_01" },
  { question: "W&rd", value: "o", slot: "tree0007", animation: "fall_02" },
  { question: "Ap&le", value: "p", slot: "tree0019", animation: "fall_03" },
  { question: "An&y", value: "d", slot: "tree0021", animation: "fall_04" }
]
window.onload = async function () {
  const dragState = {
    active: false,
    target: null,
    bone: null,
    boneStart: null,
    boneOffset: null,
    slotName: null,
    value: null,
    moved: false,
    justDragged: false,
  };
  let curQuestion = questions[0]
  let lock = false
  const cards = [];
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
    if (dragState.active || dragState.moved || dragState.justDragged || lock) return
    if(curQuestion){
      lock =true
       tree.state.setAnimationByName(0, "shake", false)
    }
  })
  tree.state.addListener({
    complete: function (entry) {
      if (entry.animation.name === "shake") {
        tree.state.setAnimationByName(0, curQuestion.animation, false)
      }
      if (entry.animation.name.startsWith("fall")) {
        tree.state.clearTrack(0);
      }
    }
  });

  world.addChild(tree);
  window.addEventListener("resize", updateUi);
  updateUi()
  // debug()
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
    const labelFixups = [];
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
        fontSize: 44,
      });
      label.anchor.set(0.5);
      container.addChild(label);
      const slot = tree.skeleton.findSlot(word.slot);
      const slotIndex = slot.data.index;
      const slotContainer = tree.slotContainers[slotIndex];
      container.scale.x = -1;
      // 逆时针旋转90度
      container.rotation = Math.PI / 2;
      slotContainer.addChild(container);
      enableDrag(container, word);
      labelFixups.push({ label, slotContainer });
    }
  }
  function pointInBounds(point, bounds) {
    return bounds.contains(point.x, point.y);
  }
  app.stage
    .on("pointermove", (e) => {
      if(!lock)return
      if (!dragState.active || !dragState.target) return;
      dragState.moved = true;
      if (dragState.bone) {
        const pointerLocal = e.getLocalPosition(tree);
        const targetWorld = {
          x: pointerLocal.x - dragState.boneOffset.x,
          y: pointerLocal.y - dragState.boneOffset.y
        };
        if (dragState.bone.parent) {
          dragState.bone.parent.worldToLocal(targetWorld);
        }
        dragState.bone.x = targetWorld.x;
        dragState.bone.y = targetWorld.y;
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
        dragState.active = true;
        dragState.target = container;
        dragState.bone = tree.skeleton.findSlot(word.slot)?.bone || null;
        dragState.slotName = word.slot;
        dragState.value = word;
        if (dragState.bone) {
          dragState.boneStart = { x: dragState.bone.x, y: dragState.bone.y };
          const pointerLocal = e.getLocalPosition(tree);
          dragState.boneOffset = {
            x: pointerLocal.x - dragState.bone.worldX,
            y: pointerLocal.y - dragState.bone.worldY
          };
        }
        dragState.moved = false;
        tree.state.clearTrack(0);
        console.log("pointerdown")
      });
  }

  function endDrag() {
    if (!dragState.target) return;
    let hit = false;
    const dropPoint = tree.toGlobal(new PIXI.Point(dragState.bone.worldX, dragState.bone.worldY))
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card) continue;
      const cardBounds = card.getBounds();
      if (pointInBounds(dropPoint, cardBounds)) {
        hit = true;
        if (typeof card.updateAnswer === "function") {
          card.updateAnswer(dragState.value);
          const slot = tree.skeleton.findSlot(dragState.slotName);
          slot.setAttachment(null); // 彻底移除显示
          const curIndex = questions.findIndex(e=>e.question==curQuestion.question)
          curQuestion = questions[curIndex+1]
          lock = false
        }
        break;
      }
    }
    if (!hit && dragState.bone && dragState.boneStart) {
      dragState.bone.x = dragState.boneStart.x;
      dragState.bone.y = dragState.boneStart.y;
      tree.skeleton.updateWorldTransform();
      tree.update(0);
    }
    dragState.active = false;
    dragState.target.cursor = "grab";
    dragState.target = null;
    dragState.bone = null;
    dragState.boneStart = null;
    dragState.boneOffset = null;
    dragState.slotName = null;
    dragState.value = null;
    dragState.justDragged = dragState.moved;
    dragState.moved = false;
    setTimeout(() => {
      dragState.justDragged = false;
    }, 0);
    console.log("endDrag")
  }

  async function loadBg() {
    const bg = PIXI.Sprite.from('./tree/bg.png')
    return bg
  }
  async function loadSpine() {
    const resource = await PIXI.Assets.load('./tree/tree.json');
    console.log('resource', resource)
    const tree = new Spine(resource.spineData);
    return tree
  }
}
class WordCard extends PIXI.Container {
  height = 50
  padding = 20
  blockWidth = 70
  blockH = 35
  gap = 4
  constructor(word) {
    super()
    this.card = new PIXI.Container();
    this.addChild(this.card);
    // 背景
    this.bg = new PIXI.Graphics();
    this.card.addChild(this.bg);
    this.word = word;
    this.textContainer = new PIXI.Container();
    this.card.addChild(this.textContainer);
    this.renderText();
  }
  renderText() {
    this.textContainer.removeChildren();
    const texts = this.word.question.split("&")
    this.firstText = new PIXI.Text(texts[0], {
      fill:0x000000,
      fontSize: 28,
      fontWeight: "bold",
    });
    this.firstText.anchor.set(0, 0.5);
    this.firstText.x = this.padding/2
    this.firstText.y = this.height/2
    this.textContainer.addChild(this.firstText)
    this.block = new PIXI.Graphics();
    this.block.clear();
    this.block.beginFill("#f7cc50",0.5);
    this.block.drawRoundedRect(this.firstText.x+this.firstText.width+this.gap, this.firstText.y-this.blockH/2, this.blockWidth, this.blockH, 4)
    this.block.endFill();
    this.textContainer.addChild(this.block)
    this.lastText = new PIXI.Text(texts[1], {
      fill:0x000000,
      fontSize: 28,
      fontWeight: "bold",
    });
    this.lastText.anchor.set(0, 0.5);
    this.lastText.x=(this.block.geometry.bounds.maxX+this.gap)
    this.lastText.y=(this.firstText.y)
    const cardWidth=this.firstText.width+this.block.width+this.lastText.width+this.gap*6
    this.textContainer.addChild(this.lastText)
    this.bg.clear();
    this.bg.beginFill(0xc0f0f8)
    this.bg.drawRoundedRect(0, 0, cardWidth, this.height, 10); // 自适应宽高
    this.bg.endFill();
  }
  updateAnswer(word) {
    const prevFirstX = this.firstText.x;
    const prevLastX = this.lastText.x;
    const correct = this.word.value===word.value
    this.answer = new PIXI.Text(word.value, {
      fill:correct?"#7fcbe6":"#ec6765",
      fontSize: 28,
      fontWeight: "bold",
    });
    this.answer.anchor.set(0.5)
    this.answer.x = this.block.geometry.bounds.minX+this.block.width/2
    this.answer.y = this.firstText.y
    this.textContainer.addChild(this.answer)

    this.firstText.x = this.answer.x-this.firstText.width-this.answer.width/2
    this.lastText.x = this.answer.x+this.answer.width-this.answer.width/2

    gsap.killTweensOf(this.answer);
    gsap.killTweensOf(this.answer.scale);
    gsap.killTweensOf(this.firstText);
    gsap.killTweensOf(this.lastText);
    gsap.killTweensOf(this.block);

    this.answer.alpha = 0;
    this.answer.scale.set(0.6);
    gsap.to(this.answer, { alpha: 1, duration: 0.18, ease: "power2.out" });
    gsap.to(this.answer.scale, { x: 1, y: 1, duration: 0.35, ease: "back.out(1.7)" });

    gsap.fromTo(this.firstText, { x: prevFirstX }, { x: this.firstText.x, duration: 0.25, ease: "power2.out" });
    gsap.fromTo(this.lastText, { x: prevLastX }, { x: this.lastText.x, duration: 0.25, ease: "power2.out" });

    gsap.to(this.block, {
      alpha: 0,
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        this.block.visible = false;
        this.block.alpha = 1;
      },
    });
  }
}
