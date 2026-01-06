import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Graphics, Sprite } from "pixi.js";
import { TextBox } from "../../../ui/TextBox";
import { engine } from "../../../getEngine";

/** Screen shown while loading assets */
export class SecondPage extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["course"];
    private background!: Graphics;
    private bg_1!: Graphics;
    private bg_2!: Graphics;
    private bg_3!: Graphics;
    private bot!: Sprite;
    private textBox?: TextBox;
    private circle!: Sprite;
    constructor() {
        super();
        this.initBg()
        this.initBot()
    }
    public initBot(){
        this.bot = Sprite.from("course/page_2_bot.png");
        this.bot.anchor.set(0.5);
        this.bot.interactive = true;
        this.bot.cursor = 'pointer'; // 鼠标移上去变手型
       
        // 添加点击事件
        this.bot.on('pointertap', async () => {
            if(this.textBox) return
            const targetRotation = this.circle.rotation + Math.PI * 2;
            animate(
                this.circle.position,
                { x: -30, y: 280 } as any,
                {
                    duration: 1.5,
                    ease: "backOut", // 使用 backOut 会有一个超出的回弹效果，更生动
                },
            );
            animate(
                this.circle,
                { alpha: 1, rotation: targetRotation } as any,
                {
                    duration: 1.5,
                    ease: "backOut",
                },
            );
            this.textBox = new TextBox({},{
                text: "Hello World!",
                style: {
                    fill: "#000",
                    align: "center",
                    fontSize: 40,
                    stroke:10,
                    fontFamily: "\"Comic Sans MS\", cursive, sans-serif",

                },
            });
            this.textBox.position.set(this.bot.width * 0.5+this.textBox.width*.8, this.bot.height+this.textBox.height*.76)
            this.addChild(this.textBox)
        });
        this.addChild(this.bot);
        this.circle = Sprite.from("course/page_2_a.png");
        this.circle.alpha = 1;
        this.circle.anchor.set(0.5);
        this.circle.position.set(-80, 230)
        this.bot.addChild(this.circle);


    }
    public initBg(){
       this.background = new Graphics();
       this.bg_1 = new Graphics();
       this.bg_2 = new Graphics();
       this.bg_3 = new Graphics();
       this.addChild(this.background)
       this.background.addChild(this.bg_1)
       this.background.addChild(this.bg_2)
       this.background.addChild(this.bg_3)

    }

    public onLoad(progress: number) {
        console.log("progress", progress)
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.background.clear();
        this.background.beginPath()
        .rect(0, 0, width, height) // 从 0,0 开始画到满屏
        .fill(0xf7d056);
        this.bg_1.beginPath()
        .rect(0, height*0.25, width, height*0.25) // 从 0,0 开始画到满屏
        .fill(0xe88a75);
        this.bg_2.beginPath()
        .rect(0, height*0.25*2, width, height*0.25) // 从 0,0 开始画到满屏
        .fill(0xf1cdb2);
        this.bg_3.beginPath()
        .rect(0, height*0.25*3, width, height*0.25) // 从 0,0 开始画到满屏
        .fill(0x6a99d2);
        this.bot.position.set(width * 0.2, height * 0.5);
    }

    /** Show screen with animations */
    public async show() {
        this.alpha = 1;

    }

    /** Hide screen with animations */
    public async hide() {
        await animate(this, { alpha: 0 } as ObjectTarget<this>, {
            duration: 0.3,
            ease: "linear",
            delay: 1,
        });
    }
}
