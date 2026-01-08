import { Text } from "pixi.js";
import type { TextOptions, TextStyleOptions } from "pixi.js";
import { LayoutContainer } from "@pixi/layout/components";
import type { LayoutContainerOptions } from "@pixi/layout/components";

const defaultTextBoxStyle: Partial<TextStyleOptions> = {
  fontFamily: "Arial Rounded MT Bold",
  fontSize: 24,
  fill: 0x000000,
  align: "center",
};

export class TextBox extends LayoutContainer {
  private textNode: Text;
  constructor(boxOpts: LayoutContainerOptions = {}, textOpts: TextOptions = {}) {
    super(boxOpts);
    const { text = "Hello PixiJS!", style = {} } = textOpts;
    this.textNode = new Text({
      text,
      style: { ...defaultTextBoxStyle, ...style },
    });
    this.textNode.layout = true
    this.addChild(this.textNode);
  }
  public updateText(text:string): void {
    this.textNode.text = text;
  }
}
