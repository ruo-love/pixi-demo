import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";
import { gsap } from "gsap";
import { EmojiCard } from "./EmojiCard";
import { engine } from "../../../getEngine";
import { ThirdPage } from "../thirdPage";

/** Screen shown while loading assets */
export class SecondPage extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["course"];
    private background: Sprite
    private role: Sprite
    private xImage?: Sprite
    private status: "idle" | "working"|"end" = "idle"
    private emojiCard?:EmojiCard
    constructor() {
        super();
        this.loadData()
        
        // 页面背景
        this.background = Sprite.from("course/page_2_bg.jpg");
        this.background.anchor.set(0.5);
        this.background.layout = {
            width: "100%",
            height: "100%",
            objectFit: "fill",
            objectPosition: "center",
        }
        this.addChild(this.background);

        this.role = Sprite.from("course/page_2_role.png");
        this.role.anchor.set(0.5);
        this.addChild(this.role);
        this.role.on("pointertap", () => {
            this.start()
        })
    }

    public onLoad(progress: number) {
        console.log("progress", progress)
    }
    private loadData(){
        return [{
            value: "Upset",
            name: "难过",
            icon: "course/page_2_emoj_1.png"
        },
        {
            value: "Smile",
            name: "微笑",
            icon: "course/page_2_emoj_2.png"
        },
        {
            value: "Embarrassed",
            name: "尴尬",
            icon: "course/page_2_emoj_3.png"
        }]
    }
    private start(){
        this.next()
    }
    private async next(){
        if(this.status == "working") return
        this.status = "working"
        await this.showXImage()
        this.showEmojIcon()
    }
    private showEmojIcon(){
        if(this.emojiCard){
            this.emojiCard.switch()
            if( this.xImage){
                this.xImage.visible = false
            }
        }else{
            const data = this.loadData()
            this.emojiCard = new EmojiCard(data,{
                size:86,
                onEnd:()=>{
                    this.status = "end"
                    engine().navigation.showScreen(ThirdPage);
                },
                onSwitchEnd:()=>{
                    this.status = "idle"
                    if( this.xImage){
                        this.xImage.visible = true
                    }
                }
            })
            this.emojiCard.position.set(-40,-this.role.height * 0.27)
            this.role.addChild(this.emojiCard)
            this.emojiCard.switch()
            if( this.xImage){
                this.xImage.visible = false
            }
        }
    }
    private async showXImage(){
        const xImg = this.getRandomXImg();
        if (!this.xImage) {
            this.xImage = Sprite.from(xImg);
            this.xImage.anchor.set(0.5);
            this.xImage.alpha = 1;
            this.xImage.eventMode = "static";
            this.xImage.cursor = 'pointer';
            this.xImage.position.set(-this.xImage.width * 0.3, -this.role.height * 0.27);
            this.xImage.on("pointertap", (e) => {
                e.stopPropagation();
                this.next();
            });
            this.role.addChild(this.xImage);
            await this.playXSequence(0.23);
            return;
        }
        await this.playXSequence(0.23);
    }
    private async playXSequence(duration: number) {
        if (!this.xImage) return;
        for (let i = 1; i <= 3; i++) {
            this.xImage.texture = Texture.from(`course/page_2_x_${i}.png`);
            this.xImage.width = 88;
            this.xImage.height = 94;
            await gsap.to(this.xImage, {
                rotation: 0.32,
                duration,
                yoyo: true,
                repeat: 3,
                ease: "sine.inOut",
            });
        }
    }
    private getRandomXImg(){
       const index = Math.floor(Math.random() * 3) + 1;
       return `course/page_2_x_${index}.png`
    }
    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.layout = { width, height };
        this.role.position.set(width * 0.5, height * 0.65);
    }

    /** Show screen with animations */
    public async show() {
        this.alpha = 1;
        gsap.fromTo(
            this.role,
            { alpha: 0, scale: 0,translateZ:-1 },
            {
                alpha: 1,
                translateZ:2,
                scale: 1,
                duration: 1.5,
                ease: "back.in",
                onComplete:()=>{
                    this.role.interactive = true;
                    this.role.cursor = 'pointer';
                }
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


