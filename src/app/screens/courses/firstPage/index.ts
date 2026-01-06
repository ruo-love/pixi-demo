import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Text } from "pixi.js";
import { TextBox } from "../../../ui/TextBox";
import { engine } from "../../../getEngine";
import { SecondPage } from "../secondPage";

/** Screen shown while loading assets */
export class FirstPage extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["course"];
    private background!: Sprite
    private title!: TextBox
    constructor() {
        super();
        this.initBg()
        this.initTitle()
    }
    public initBg(){
        this.background = Sprite.from("course/page_1_bg.png");
        this.background.anchor.set(0.5);
        this.addChild(this.background);
    }
    public initTitle(){
        this.title = new TextBox({},{
            text: "Game Center",
            style: {
                fill: "#000",
                align: "center",
                fontSize: 90
            },
        })
        // this.title.layout = {
        //     width:"50%",
        //     height:"50%",
        //     justifyContent: "center",
        //     alignItems: "center",
        //     backgroundColor:"red"
        // }
        this.title.interactive = true;
        this.title.cursor = 'pointer'; // 鼠标移上去变手型
        // 添加点击事件
        this.title.on('pointertap', async () => {
            // 1. 简单的按下反馈动画
            const down = animate(
                this.title,
                { scale: 0.95 } as ObjectTarget<any>,
                { duration: 0.1 },
            );
            await down.finished;
            const up = animate(
                this.title,
                { scale: 1 } as ObjectTarget<any>,
                { duration: 0.1 },
            );
            await up.finished;
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
        this.background.position.set(width * 0.5, height * 0.5);
        const texture = this.background.texture;
        const scale = Math.max(width / texture.width, height / texture.height);
        this.background.scale.set(scale);
        console.log("resize", width, height,this.title.width,this.title.height)
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
