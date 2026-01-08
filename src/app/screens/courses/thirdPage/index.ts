import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Assets, Container, Sprite } from "pixi.js";
import { TextBox } from "../../../ui/TextBox";
import { gsap } from "gsap";
import { LayoutContainer, LayoutSprite } from "@pixi/layout/components";
interface IWordDataItem {
    value: string
    name: string
    icon: string
}
/** Screen shown while loading assets */
export class ThirdPage extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["course"];
    private headContainer: LayoutContainer
    private avatar:Sprite
    private message:TextBox
    private messageBg:Sprite
    private messageWrap: LayoutContainer
    private mainContainer: LayoutContainer
    private temImage:Sprite
    private wordCardRefs:LayoutSprite[]=[]
    private wordCardZ = 0
    private status:"init"|"working" = "init"
    private data:IWordDataItem[]=[{
            value: "smile",
            name: "微笑",
            icon: "course/page_2_emoj_1.png",
        },
        {
            value: "happy",
            name: "快乐",
            icon: "course/page_2_emoj_2.png"
        },
        {
            value: "cry",
            name: "哭",
            icon: "course/page_2_emoj_3.png"
        },
        {
            value: "sad",
            name: "难过",
            icon: "course/page_2_emoj_3.png"
        }]
    constructor() {
        super();
        this.headContainer = new LayoutContainer({
            layout: {
                width: "100%",
                justifyContent:"flex-start",
                alignItems:"center",
                paddingLeft:"10%",
                flexGrow:1,
                backgroundColor: "white",
            }
        })
        this.mainContainer = new LayoutContainer({
            layout: {
                width: "100%",
                flexGrow:2,
                backgroundColor: "#c39d9b",
                justifyContent:"center",
                alignItems:"center"
            }
        })
        this.mainContainer.sortableChildren = true;
        this.addChild(this.headContainer)
        this.avatar = Sprite.from("course/page_3_user_avatar.png");
        this.avatar.layout = true;
        this.avatar.anchor.set(0.5);
        this.headContainer.addChild(this.avatar);

        this.messageBg = Sprite.from("course/page_3_user_message_bg.png")
        this.messageBg.layout={
            height:this.avatar.height
        }
        this.messageBg.anchor.set(0.5);
        this.headContainer.addChild(this.messageBg);
        this.message = new TextBox({
            layout:{
                paddingLeft:40,
                paddingRight:40,
                paddingTop:20,
                paddingBottom:20,
                justifyContent:"center",
                alignItems:"center",
               
            },
        },{
            text:"",
            style:{
                fontSize:34
            }
        })
        this.messageWrap = new LayoutContainer({
            layout: {
                width: this.messageBg.width,
                height: this.messageBg.height,
                justifyContent: "center",
                alignItems: "center",
            },
        });
        this.messageWrap.position.set(
            -this.messageBg.width / 2,
            -this.messageBg.height / 2,
        );
        this.messageWrap.addChild(this.message);
        this.messageBg.addChild(this.messageWrap);
       
        this.addChild(this.mainContainer)
        this.temImage = Sprite.from("course/page_3_tem.png")
        this.temImage.anchor.set(0.5);
        this.temImage.layout = {
            width:400
        }
        this.temImage.eventMode = "static";
        this.temImage.cursor = 'pointer';
        this.temImage.on("pointertap",(e)=>{
            e.stopPropagation()
            // if(this.status=="working") return
            // this.showWords()
        })
        this.mainContainer.addChild(this.temImage);
        this.initWordCar()
    }
    
    public async initWordCar(){
        for(let i=0;i<this.data.length;i++){
            const word = this.data[i]
            const texture = await Assets.load(`course/page_3_word_${word.value}.png`);
            const wordRef = new LayoutSprite({
                texture,
                layout: {
                    width: 100,
                    height: 100,
                    objectFit: 'contain',
                    backgroundColor: "#fff",
                    borderColor: "#ccc",
                    borderWidth:2,
                    borderRadius: 10,
                },
            });
            const left = i < 2 ? 10 + Math.random() * 10 : 70 + Math.random() * 20;
            const top = 20 + Math.random() * 50;
            wordRef.layout = {
                position:"absolute",
                left:`${left}%`,
                top:`${top}%`
            }
            wordRef.alpha = 0
            wordRef.eventMode = "static";
            wordRef.cursor = 'pointer';
            wordRef.on("pointertap",()=>{
                this.activedWord(wordRef,word)
            })
            this.wordCardRefs.push(wordRef)
            this.mainContainer.addChild(wordRef);
            this.showWords()
        }
    }
    public showWords(){
        let tl = gsap.timeline();
         this.status = "working"
        for(let i=0;i<this.data.length;i++){
            const cur = this.wordCardRefs[i]
            tl.fromTo(cur,{
                x:i>1?-300:300,
                y:0,
                rotation: 12
            }, {duration: .5,x:0,y:0,alpha:1,rotation: 0,ease:"back.inOut"})
        }
    }
    public activedWord(wordRef:LayoutSprite,word:IWordDataItem){
        wordRef.zIndex = ++this.wordCardZ;
        this.message.updateText(word.value)
        const computedPixiLayout =this.temImage.layout!.computedPixiLayout
        const computedLayout=this.temImage.layout!.computedLayout
        const wordRefComputedPixiLayout =wordRef.layout!.computedPixiLayout
        const initLayout = {
            left:wordRefComputedPixiLayout.x,
            top:wordRefComputedPixiLayout.y,
        }
        const left =computedPixiLayout.x+computedLayout.width/2-wordRef.width/2
        const top =computedPixiLayout.y+computedLayout.height/2-wordRef.width/2
        gsap.to(initLayout,{
            left,
            top,
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => {
                wordRef.layout = {
                    borderColor: "transparent",
                    borderRadius:wordRef.width/2,
                    left:initLayout.left,
                    top:initLayout.top
                };
            },
        })
        console.log(wordRef.layout)
    }
    public onLoad(progress: number) {
        console.log("progress", progress)
    }

    /** Resize the screen, fired whenever window size changes  */
    public resize(width: number, height: number) {
        this.layout = {
            width,
            height,
            flexDirection:"column",
            alignItems: "flex-start"
        };
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
