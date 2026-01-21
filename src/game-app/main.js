
import { Application, Assets, Container, Sprite, Texture } from 'pixi.js';
import '@esotericsoftware/spine-pixi-v8';
import { Controller } from './Controller';
import { Scene } from './Scene';
import { SpineBoy } from './SpineBoy';
import manifest from "../manifest.json"
import Word from './Word';
import gsap from 'gsap';
// Asynchronous IIFE
(async () => {
    // Create a PixiJS application.
    const app = new Application();

    // Intialize the application.
    await app.init({ background: '#1099bb', resizeTo: window });
    const root = document.getElementById("pixi-container")
    // Then adding the application's canvas to the DOM body.
    root.appendChild(app.canvas);
    loadResetBtn()
    const world = new Container()
    app.stage.addChild(world)
    await Assets.init({ manifest, basePath: "assets" }); //初始化资源模块清单
    // Load the assets.
    await Assets.loadBundle(["spineboy"])
    // Create a controller that handles keyboard inputs.
    const controller = new Controller();

    // Create a scene that holds the environment.
    const scene = new Scene(app.screen.width, app.screen.height);

    // Create our character
    const spineBoy = new SpineBoy();

    // Adjust views' transformation.
    //人类
    scene.view.y = app.screen.height;
    spineBoy.view.x = app.screen.width / 2 - 200;
    spineBoy.view.y = app.screen.height - scene.floorHeight;
    spineBoy.spine.scale.set(scene.scale * 0.32);

    //怪兽
    const bot = new SpineBoy();
    bot.view.x = app.screen.width - spineBoy.view.x + 200;
    bot.view.y = app.screen.height - scene.floorHeight;
    bot.view.scale.x = -1
    bot.spine.scale.set(scene.scale * 0.32);
    // Add scene and character to the stage.
    world.addChild(scene.view, spineBoy.view, bot.view);
    loadWords()
    // Trigger character's spawn animation.
    spineBoy.spawn();
    bot.spawn();
  
    function loadWords() {
        const data = [{
            value: "apple",
            image: "apple.png",
            correct: true
        },
        {
            value: "orange",
            image: "orange.png",
            correct: false
        }]
        const cards = []
        const space = app.screen.width / (data.length + 1)
        data.forEach((w, i) => {
            const wordCard = new Word({
                word: w.value,
                image: w.image
            });
            wordCard.x = space * (i + 1)
            wordCard.y = app.screen.height / 2 - 200
            wordCard.interactive = true
            wordCard.cursor = "pointer"
            wordCard.on("pointerdown", () => {
                selected(w)
            })
            cards.push(wordCard)
        })
        world.addChild(...cards)
    }
    function selected(word) {
        if (word.correct) {
            spineBoy.state.hover = true
            gsap.to(spineBoy.view, {
                x: bot.view.x - bot.view.width - 50,
                duration: 2,
                onComplete: () => {
                    spineBoy.state.hover = false
                    const spineBoyEntry = spineBoy.spine.state.setAnimation(0, "jump", false);
                    const jumpDuration = spineBoyEntry.animation.duration;
                    const halfTime = jumpDuration * 0.5;
                    const shootEntry = spineBoy.spine.state.addAnimation(0, "shoot", false, -halfTime)
                    spineBoy.spine.state.addAnimation(0, "idle", true, 0);
                    shootEntry.listener = {
                        start: () => {
                            const entry = bot.spine.state.setAnimation(0, "death", false);
                            entry.timeScale = 1;
                        }
                    };
                },
            });
        } else {
            spineBoy.state.run = true
            const targetX = (bot.view.x - spineBoy.view.x) / 2 + spineBoy.view.x
            gsap.to(spineBoy.view, {
                x: targetX,
                duration: 1,
                onComplete: () => {
                    spineBoy.state.run = false
                    bot.spine.state.setAnimation(0, "aim", false);
                    const shootEntry = bot.spine.state.addAnimation(0, "shoot", false, 0)
                    bot.spine.state.addAnimation(0, "idle", true, 0);
                    shootEntry.listener = {
                        start: () => {
                            const entry = spineBoy.spine.state.setAnimation(0, "death", false);
                            entry.timeScale = 1;
                        }
                    };
                },
            });
        }
    }
    function loadResetBtn() {
        const resetButton = document.createElement("button");
        resetButton.textContent = "重置";
        resetButton.style.position = "fixed";
        resetButton.style.top = "16px";
        resetButton.style.left = "46%";
        resetButton.style.zIndex = "10";
        resetButton.style.padding = "10px 36px";
        resetButton.style.border = "2px solid #0b2a3c";
        resetButton.style.borderRadius = "10px";
        resetButton.style.background = "linear-gradient(180deg, #3ad2ff 0%, #1b7bbd 100%)";
        resetButton.style.color = "#0b1d2a";
        resetButton.style.fontFamily = "\"Press Start 2P\", \"Trebuchet MS\", sans-serif";
        resetButton.style.fontSize = "12px";
        resetButton.style.letterSpacing = "1px";
        resetButton.style.boxShadow = "0 4px 0 #0b2a3c, 0 8px 16px rgba(0,0,0,0.35)";
        resetButton.style.cursor = "pointer";
        resetButton.style.textTransform = "uppercase";
        resetButton.style.transition = "transform 0.08s ease, box-shadow 0.08s ease";
        resetButton.addEventListener("pointerdown", () => {
            resetButton.style.transform = "translateY(2px)";
            resetButton.style.boxShadow = "0 2px 0 #0b2a3c, 0 6px 12px rgba(0,0,0,0.35)";
        });
        resetButton.addEventListener("pointerup", () => {
            resetButton.style.transform = "translateY(0)";
            resetButton.style.boxShadow = "0 4px 0 #0b2a3c, 0 8px 16px rgba(0,0,0,0.35)";
        });
        resetButton.addEventListener("pointerleave", () => {
            resetButton.style.transform = "translateY(0)";
            resetButton.style.boxShadow = "0 4px 0 #0b2a3c, 0 8px 16px rgba(0,0,0,0.35)";
        });
        resetButton.addEventListener("click", () => {
            window.location.reload();
        });
        document.body.appendChild(resetButton);
    }
    // Animate the scene and the character based on the controller's input.
    app.ticker.add(() => {
        spineBoy.update();
        bot.update();
    });
})();
