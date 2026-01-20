import * as PIXI from "pixi.js"
import gsap from "gsap"
import { Spine, SpineDebugRenderer } from '@pixi-spine/all-3.8' // Do this once at the very start of your code. This registers the loader!
let appRef = null;
let overlayLayer = null;
import { sound } from '@pixi/sound';
const rem = window.document.body.clientWidth/10*1;
window.onload = async function () {
  const questions = [
    { question: "gi&e", value: "v", slot: "tree0006", animation: "fall_01", audio: "./tree/mp3/give.mp3",img:"./tree/words/give.png", valueAudio: "./tree/mp3/v.mp3" },
    { question: "sto&e", value: "v", slot: "tree0007", animation: "fall_02", audio: "./tree/mp3/stove.mp3",img:"./tree/words/stove.png", valueAudio: "./tree/mp3/v.mp3" },
    { question: "ele&en", value: "v", slot: "tree0019", animation: "fall_03", audio: "./tree/mp3/eleven.mp3",img:"./tree/words/eleven.png", valueAudio: "./tree/mp3/v.mp3" },
  ]
  const filled = []
  let timer = 0
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
  appRef = app;
  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  const root = document.getElementById("pixi-container");
  root.appendChild(app.view);
  //初始化世界
  const world = new PIXI.Container();
  world.eventMode = "static";
  app.stage.addChild(world)
  overlayLayer = new PIXI.Container();
  overlayLayer.eventMode = "none";
  app.stage.addChild(overlayLayer);

  //初始化背景
  const bg = await loadBg()
  world.addChild(bg);

  const handleAni = new HandleAni()
  //加载spine动画
  const tree = await loadSpine()
  tree.alpha = 0;
  tree.eventMode = "static";  // 开启交互
  tree.cursor = "pointer"
  gsap.to(tree, { alpha: 1, duration: 1.5, ease: "power2.out" });
  tree.on('pointerdown', (event) => {
    if (dragState.active || dragState.moved || dragState.justDragged || lock) return
    if (curQuestion) {
      lock = true
      clearInterval(timer)
      tree.state.setAnimationByName(0, "shake", false)
    }
  })
  tree.state.addListener({
    complete: function (entry) {
      if (entry.animation.name === "shake") {
        tree.state.setAnimationByName(0, curQuestion.animation, false)
        initHand("fall")
      }
      if (entry.animation.name.startsWith("fall")) {
        tree.state.clearTrack(0);

      }
    }
  });
  world.addChild(tree);
  world.addChild(handleAni)
  initHand()
  window.addEventListener("resize", updateUi);
  updateUi()
  // debug()
  loadWords()
  loadQuestions()
  app.stage
    .on("pointermove", (e) => {
      if (!lock) return
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
  function updateUi() {
    bg.width = app.screen.width
    bg.height = app.screen.height
    tree.x = app.screen.width / 2;
    tree.y = app.screen.height * 0.6;
    tree.scale.set(.6);
  }
  function initHand(type = "tree") {
    if (type == "tree") {
      timer = setInterval(() => {
        if (tree && !lock) {
          handleAni.x = tree.x - handleAni.width / 2
          handleAni.y = tree.y - handleAni.height
          handleAni.show()
        }
      }, 5000);
    } else if (type == "fall") {
      timer = setInterval(() => {
        handleAni.show()
        const slot = tree.skeleton.findSlot(curQuestion.slot);
        const slotIndex = slot.data.index;
        const slotContainer = tree.slotContainers[slotIndex];
        const globalPos = tree.toGlobal(slotContainer.position);
        const bounds = handleAni.getBounds();
        handleAni.x = globalPos.x - bounds.width / 2;
        handleAni.y = globalPos.y - bounds.height / 2;
      }, 5000);
    }
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
    const gap = 60;
    for (let i = 0; i < questions.length; i++) {
      const card = new WordCard(questions[i]);
      cards.push(card);
    }
    const totalWidth = cards.reduce((sum, card) => sum + card.width, 0) + gap * (cards.length - 1);
    let startX = (app.screen.width - totalWidth) / 2;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardWidth = card.width;
      const targetX = startX;
      const targetY = tree.y + 100;
      card.x = targetX;
      card.y = targetY;
      world.addChildAt(card, 1)

      const centerX = app.screen.width / 2;
      const centerY = app.screen.height + 120;
      const scatterX = gsap.utils.random(-280, 280, 1);
      const scatterY = gsap.utils.random(60, 220, 1);
      const spin = gsap.utils.random(-0.35, 0.35, 0.01);

      card.alpha = 0;
      card.scale.set(0.4);
      card.rotation = spin;
      card.x = centerX + scatterX;
      card.y = centerY + scatterY;

      gsap.to(card, {
        x: targetX,
        y: targetY,
        alpha: 1,
        rotation: 0,
        duration: 1.2,
        delay: i * 0.06,
        ease: "expo.out",
      });
      gsap.to(card.scale, {
        x: 1,
        y: 1,
        duration: 1.5,
        delay: i * 0.06,
        ease: "elastic.out(1, 0.5)",
      });
      startX += cardWidth + gap;
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
      sound.add(`value-${word.question}`, word.valueAudio)
      container.on("pointerdown", (e) => {
        e.stopPropagation()
        if (lock && word.question == curQuestion.question) return
        sound.play(`value-${word.question}`)
      })
      container.cursor = "grab";
      const bg = new PIXI.Graphics();
      bg.drawCircle(0, 0, 45);
      container.addChild(bg);
      bg.hitArea = new PIXI.Circle(0, 0, 45);
      const label = new PIXI.Text(word.value, {
        fill: 0x000000,
        fontSize: 44,
        "fontFamily": "\"Comic Sans MS\", cursive, sans-serif",
        "padding": 5,
        "wordWrap": true
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
      });
  }

  function endDrag() {
    if (!dragState.target) return;
    let hit = false;
    const dropPoint = tree.toGlobal(new PIXI.Point(dragState.bone.worldX, dragState.bone.worldY))
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const exist= filled.find(e=>e.question===card.word.question) 
      if (!card || exist) continue;
      const cardBounds = card.getBounds();
      if (pointInBounds(dropPoint, cardBounds)) {
        hit = true;
        if (typeof card.updateAnswer === "function") {
          filled.push(card.word)
          card.updateAnswer(dragState.value);
          const slot = tree.skeleton.findSlot(dragState.slotName);
          slot.setAttachment(null); // 彻底移除显示
          const curIndex = questions.findIndex(e => e.question == curQuestion.question)
          curQuestion = questions[curIndex + 1]
          lock = false
          clearInterval(timer)
          if (curQuestion) {
            initHand("tree")
          }else{
            finished()
          }
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
    bg.width = app.screen.width
    bg.height = app.screen.height
    return bg
  }
  async function loadSpine() {
    const resource = await PIXI.Assets.load('./tree/tree.json');
    console.log('resource', resource)
    const tree = new Spine(resource.spineData);
    return tree
  }
  function finished(){
    gsap.killTweensOf(tree);
    gsap.to(tree, {
      alpha: 0,
      duration: 0.3,
      ease: "power2.out",
      onComplete: () => {
        tree.visible = false;
        tree.alpha = 1;
      },
    });
    for(let i=0;i<cards.length;i++){
      const card = cards[i]
      gsap.killTweensOf(card);
      gsap.to(card, {
        y: app.screen.height/2,
        duration: 0.4,
        delay: i * 0.06,
        ease: "power2.out",
      });
    }
  }
}
class WordCard extends PIXI.Container {
  height = rem*0.46
  padding = rem*0.33
  blockWidth = rem
  fontSize = 0.185*rem
  blockH = 0.24*rem
  gap = 8
  status = "empty"
  word = null
  constructor(word) {
    super()
    this.card = new PIXI.Container();
    this.addChild(this.card);
    // 背景
    this.bg = new PIXI.Graphics();
    this.card.addChild(this.bg);
    this.word = word;
    sound.add(word.question, word.audio);
    this.textContainer = new PIXI.Container();
    this.textContainer.interactive = true
    this.textContainer.on("pointerdown", () => {
      if (this.status == "fill") {
        sound.play(word.question);
        this.showWordImage(word.img);
      }
    })
    this.card.addChild(this.textContainer);
    this.renderText();
  }
  showWordImage(imgPath) {
    if (!imgPath || !appRef || !overlayLayer) return;
    if (this.wordImgTimer) {
      clearTimeout(this.wordImgTimer);
      this.wordImgTimer = null;
    }
    if (this.wordImgSprite) {
      gsap.killTweensOf(this.wordImgSprite);
      this.wordImgSprite.destroy({ texture: true, baseTexture: false });
      this.wordImgSprite = null;
    }
    const tex = PIXI.Texture.from(imgPath);
    this.wordImgSprite = new PIXI.Sprite(tex);
    this.wordImgSprite.anchor.set(0.5);
    this.wordImgSprite.x = appRef.screen.width / 2;
    this.wordImgSprite.y = appRef.screen.height / 2;
    this.wordImgSprite.alpha = 0;
    overlayLayer.addChild(this.wordImgSprite);
    gsap.to(this.wordImgSprite, { alpha: 1, duration: .6, ease: "power2.in" });
    this.wordImgTimer = setTimeout(() => {
      if (!this.wordImgSprite) return;
      gsap.to(this.wordImgSprite, {
        alpha: 0,
        duration: .7,
        ease: "power2.in",
        onComplete: () => {
          if (this.wordImgSprite) {
            this.wordImgSprite.destroy({ texture: true, baseTexture: false });
            this.wordImgSprite = null;
          }
        },
      });
      this.wordImgTimer = null;
    }, 1000);
  }
  renderText() {
    this.textContainer.removeChildren();
    const texts = this.word.question.split("&")
    this.firstText = new PIXI.Text(texts[0], {
      fill: 0x000000,
      fontSize:this.fontSize,
      "fontFamily": "\"Comic Sans MS\", cursive, sans-serif",
      "padding": 5,
      "wordWrap": true
    });
    this.firstText.anchor.set(0, 0.5);
    this.firstText.x = this.padding / 2
    this.firstText.y = this.height / 2
    this.textContainer.addChild(this.firstText)

    const base = PIXI.Texture.from("./tree/fill.png");
    const frame = new PIXI.Rectangle(379, 580, 133, 37);
    const texture= new PIXI.Texture(base.baseTexture, frame)
    this.block = new PIXI.Sprite(texture);
    this.block.x =this.firstText.x + this.firstText.width + this.gap
    this.block.y = this.height / 2 - this.blockH/2
    this.block.width = this.blockWidth
    this.block.height = this.blockH
    this.textContainer.addChild(this.block)
    this.lastText = new PIXI.Text(texts[1], {
      fill: 0x000000,
      fontSize:this.fontSize,
      "fontFamily": "\"Comic Sans MS\", cursive, sans-serif",
      "padding": 5,
      "wordWrap": true
    });
    this.lastText.anchor.set(0, 0.5);
    this.lastText.x = (this.block.width+this.block.x + this.gap)
    this.lastText.y = (this.firstText.y)
    const cardWidth = this.firstText.width + this.block.width + this.lastText.width + this.gap * 2+this.padding
    this.textContainer.addChild(this.lastText)
    this.bg.clear();
    this.bg.beginFill(0xc0f0f8)
    this.bg.drawRoundedRect(0, 0, cardWidth, this.height, 10); // 自适应宽高
    this.bg.endFill();
  }
  updateAnswer(word) {
    this.status = "fill"
    const prevFirstX = this.firstText.x;
    const prevLastX = this.lastText.x;
    const correct = this.word.value === word.value
    this.answer = new PIXI.Text(word.value, {
      fill: correct ? "#7fcbe6" : "#ec6765",
     fontSize:this.fontSize,
      fontWeight: "bold",
      "fontFamily": "\"Comic Sans MS\", cursive, sans-serif",
      "padding": 5,
      "wordWrap": true
    });
    this.answer.anchor.set(0.5)
    this.answer.x = this.block.x + this.block.width / 2
    this.answer.y = this.firstText.y
    this.textContainer.addChild(this.answer)

    this.firstText.x = this.answer.x - this.firstText.width - this.answer.width / 2
    this.lastText.x = this.answer.x + this.answer.width - this.answer.width / 2

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


class HandleAni extends PIXI.Container {
  aniSprites = []
  timer = 0
  constructor() {
    super()
    this.wrap = new PIXI.Container()
    this.addChild(this.wrap)
    const base = PIXI.Texture.from("./tree/icons.png");
    const frame1 = new PIXI.Rectangle(362, 2, 104, 111); // 区域1
    const frame2 = new PIXI.Rectangle(468, 2, 103, 110); // 区域2
    this.frames = [
      new PIXI.Texture(base.baseTexture, frame1),
      new PIXI.Texture(base.baseTexture, frame2),
    ];
    this.sprite = new PIXI.Sprite(this.frames[0]);
    this.sprite.x = 20;
    this.sprite.y = 20;
    this.wrap.addChild(this.sprite);

    this._frameIndex = 0;
    this._elapsed = 0;
    this._frameDuration = 0.63; // 秒
    this._playing = false;
    this._tick = (delta) => {
      this._elapsed += delta / 60;
      if (this._elapsed < this._frameDuration) return;
      this._elapsed = 0;
      this._frameIndex = (this._frameIndex + 1) % this.frames.length;
      this.sprite.texture = this.frames[this._frameIndex];
    };
    this.visible = false;
  }
  show() {
    if (this._playing) return;
    this._playing = true;
    this.visible = true;
    this._elapsed = 0;
    this._frameIndex = 0;
    this.sprite.texture = this.frames[0];
    PIXI.Ticker.shared.add(this._tick);
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.hide()
    }, 1500);
  }
  hide() {
    if (!this._playing) return;
    this._playing = false;
    PIXI.Ticker.shared.remove(this._tick);
    this.visible = false;
  }
}
