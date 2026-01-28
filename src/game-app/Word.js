import { Container, Graphics, Sprite, Text, Texture } from "pixi.js";

export default class Word extends Container{
    constructor(options = {}){
        super()

        const {
            word = "Sunflower",
            image = null,
            width = 240,
            height = 210,
            radius = 22,
            accent = 0xffd166,
            background = 0xffffff,
            border = 0x1f2933,
            imageBackground = 0xf3f4f6,
        } = options;

        this.cardWidth = width;
        this.cardHeight = height;
        this.imageWidth = width - 32;
        this.imageHeight = Math.round(height * 0.55);
        this._image = null;

        const shadow = new Graphics()
            .roundRect(8, 10, width, height, radius)
            .fill({ color: 0x000000, alpha: 0.18 });

        const card = new Graphics()
            .roundRect(0, 0, width, height, radius)
            .fill({ color: background })
            .stroke({ color: border, width: 3, alpha: 0.85 });

        const accentBar = new Graphics()
            .roundRect(12, 12, width - 24, 12, 6)
            .fill({ color: accent, alpha: 0.95 });

        const imageFrame = new Graphics()
            .roundRect(16, 30, this.imageWidth, this.imageHeight, 16)
            .fill({ color: imageBackground })
            .stroke({ color: border, width: 2, alpha: 0.12 });

        const imageMask = new Graphics()
            .roundRect(16, 30, this.imageWidth, this.imageHeight, 16)
            .fill({ color: 0xffffff });
        this.imageView = new Container();
        this.imageView.x = 16;
        this.imageView.y = 30;
        this.imageView.mask = imageMask;

        const wordShadow = new Text({
            text: word,
            style: {
                fill: "#f7cc50",
                fontFamily: "Trebuchet MS, Arial, sans-serif",
                fontSize: 30,
                fontWeight: "700",
                letterSpacing: 1,
            },
        });
        wordShadow.anchor.set(0.5);
        wordShadow.alpha = 0.12;
        wordShadow.x = width / 2 + 1;
        wordShadow.y = height - 32 + 2;

        this.wordText = new Text({
            text: word,
            style: {
                fill: "#f7cc50",
                fontFamily: "Trebuchet MS, Arial, sans-serif",
                fontSize: 30,
                fontWeight: "700",
                letterSpacing: 1,
            },
        });
        this.wordText.anchor.set(0.5);
        this.wordText.x = width / 2;
        this.wordText.y = height - 32;

        this.addChild(shadow, card, accentBar, imageFrame, this.imageView, imageMask, wordShadow, this.wordText);

        this.pivot.set(width / 2, height / 2);
        this.setImage(image, accent);
    }

    setWord(word){
        this.wordText.text = word;
    }

    setImage(image, accent = 0xffd166){
        if (this._image) {
            this.imageView.removeChild(this._image);
            this._image.destroy?.();
        }

        if (image instanceof Sprite) {
            this._image = image;
        } else if (image instanceof Texture) {
            this._image = new Sprite(image);
        } else if (typeof image === "string") {
            this._image = Sprite.from(image);
        } else {
            this._image = this.createPlaceholder(accent);
        }
        this._fitSprite(this._image, this.imageWidth, this.imageHeight);
        this.imageView.addChild(this._image);
    }

    _fitSprite(sprite, width, height){
        const fit = () => {
            const texWidth = sprite.texture?.width || sprite.width || 1;
            const texHeight = sprite.texture?.height || sprite.height || 1;
            const scale = Math.min(width / texWidth, height / texHeight);
            sprite.scale.set(scale);
            sprite.x = (width - sprite.width) / 2;
            sprite.y = (height - sprite.height) / 2;
        };

        fit();
        sprite.on?.("textureUpdate", fit);
    }

    createPlaceholder(accent){
        const placeholder = new Graphics();
        const centerX = this.imageWidth / 2;
        const centerY = this.imageHeight / 2 - 4;
        const radius = Math.min(this.imageWidth, this.imageHeight) * 0.22;

        placeholder
            .circle(centerX, centerY, radius + 18)
            .fill({ color: 0xffffff, alpha: 0.65 })
            .circle(centerX, centerY, radius)
            .fill({ color: accent, alpha: 0.95 });

        for (let i = 0; i < 8; i += 1) {
            const angle = (Math.PI * 2 * i) / 8;
            const startX = centerX + Math.cos(angle) * (radius + 6);
            const startY = centerY + Math.sin(angle) * (radius + 6);
            const endX = centerX + Math.cos(angle) * (radius + 22);
            const endY = centerY + Math.sin(angle) * (radius + 22);
            placeholder
                .moveTo(startX, startY)
                .lineTo(endX, endY)
                .stroke({ color: accent, width: 4, alpha: 0.8, cap: "round" });
        }

        return placeholder;
    }
}
