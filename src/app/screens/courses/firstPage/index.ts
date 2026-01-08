import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite } from "pixi.js";
import { TextBox } from "../../../ui/TextBox";
import { engine } from "../../../getEngine";
import { SecondPage } from "../secondPage";
import { gsap } from "gsap";

/** Screen shown while loading assets */
export class FirstPage extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["course"];
    private background: Sprite
    private title!: TextBox
    constructor() {
        super();
        // 页面背景
        this.background = Sprite.from("course/page_1_bg.png");
        this.background.anchor.set(0.5);
        this.background.layout = {
            width:"100%",
            height:"100%",
            objectFit: "fill",
            objectPosition: "center",
        }
        this.addChild(this.background);

        // 页面标题
        this.title = new TextBox({
            layout:{
                position:"absolute",
                left:"20%",
                top:"20%",
                borderWidth: 2,
                borderColor: 0x000000,
                padding:30,
                backgroundColor:"white",
                borderRadius:30,
            }
        },{
            text: "Game Center",
            style: {
                fill: "#000",
                align: "center",
                fontSize: 90
            },
        })
        this.title.interactive = true;
        this.title.cursor = 'pointer'; // 鼠标移上去变手型
        // 添加点击事件
        this.title.on('pointertap', async () => {
            // 1. 简单的按下反馈动画
            await gsap.to(this.title.scale, {
                x: 0.95,
                y: 0.95,
                duration: 0.1,
                ease: "power1.out",
                yoyo: true,
                repeat: 1,
            });
            await engine().navigation.showScreen(SecondPage);
        });
        this.addChild(this.title)
    }

    public onLoad(progress: number) {
        console.log("progress", progress)
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.layout = { width, height };
    }

    /** Show screen with animations */
    public async show() {
        this.alpha = 1;
        gsap.fromTo(
            this.title,
            { alpha: 0, y: this.title.y + 140, scale: 0.85 },
            {
                alpha: 1,
                y: this.title.y,
                scale: 1,
                duration: 1.5,
                ease: "elastic.out(1, 0.5)",
            },
        );

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
