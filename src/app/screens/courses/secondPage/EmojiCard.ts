import { Sprite, Texture } from "pixi.js";
import { TextBox } from "../../../ui/TextBox";
import { LayoutContainer } from "@pixi/layout/components";

interface IEmojiDataItem {
    value: string
    name: string
    icon: string
}
interface IEmojiCardOptions {
    size:number,
    onSwitchEnd?:(data:IEmojiDataItem)=>void
    onEnd?:()=>void
}
export class EmojiCard extends LayoutContainer {
    private data: IEmojiDataItem[] = []
    private currentEmoji?:IEmojiDataItem
    private emoji?:Sprite
    private options:IEmojiCardOptions
    private text?:TextBox

    constructor(data: IEmojiDataItem[],options:IEmojiCardOptions={size:86}){
        super();
        this.data = data;
        this.options = options
    }
    switch(){
        if(this.data.length==0) return
        if(!this.currentEmoji){
            this.currentEmoji = this.data[0]
            this.show()
        }else{
            const curIndex = this.data.findIndex((item)=>item.value===this.currentEmoji?.value);
            const nextData = this.data[curIndex+1]
            if(nextData){
                this.currentEmoji = nextData;
                this.show()
            }else{
               
            } 
        }
        
    }
    show(){
        if(!this.currentEmoji) return
        if(this.emoji){
            this.emoji.texture = Texture.from(this.currentEmoji.icon);
            this.visible = true
        }else{
            this.emoji = Sprite.from(this.currentEmoji.icon);
            this.emoji.width = this.options.size
            this.emoji.height = this.options.size
            this.emoji.anchor.set(0.5);
            this.emoji.alpha = 1;
            this.emoji.eventMode = "static";
            this.emoji.cursor = 'pointer';
            this.emoji.on("pointertap", (e) => {
                e.stopPropagation();
                if(!this.currentEmoji) return
                const that = this;
                if(!this.text){
                    this.text = new TextBox({
                        layout:{
                        position:"absolute",
                        left:200,
                        top:-40,
                        borderWidth: 2,
                        borderColor: 0x000000,
                        paddingTop:10,
                        paddingBottom:10,
                        paddingLeft:30,
                        paddingRight:30,
                        backgroundColor:"#f9db78",
                        borderRadius:10,
                        }
                    },{
                        text:this.currentEmoji.value,
                        style:{
                            fontSize: 34,
                        }
                    })
                    this.text.eventMode = "static";
                    this.text.cursor = 'pointer';
                    this.text.on("pointertap", (e) => {
                        e.stopPropagation()
                        this.visible = false
                        if(this.text){
                            this.text.visible=false
                        }
                        if(this.data[this.data.length-1].value==that.currentEmoji!.value){
                            this.options.onEnd&&this.options.onEnd();
                        }else{
                            this.options.onSwitchEnd&&this.options.onSwitchEnd(that.currentEmoji!);
                        }
                    })
                    this.addChild(this.text)
                }else{
                    this.text.visible = true;
                    this.text.updateText(this.currentEmoji.value) 
                }
            });
            this.addChild(this.emoji);
        }
    }
}