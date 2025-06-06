/**
 * Fluent builder for creating bitmap typography with various effects.
 */
class TypographyBuilder {
    #width;
    #height;
    #text = "";
    #fontFamily = "Arial";
    #fontSize = 48;
    #isFontSizeAuto = false;
    #padding = 20;
    #fillStyle = "#ffffff";
    #strokeStyle = "#ffffff";
    #strokeWidth = 1;
    #glowColor = null;
    #glowSize = 0;
    #shadowOffsetX = 0;
    #shadowOffsetY = 0;
    #blurAmount = 0;
    #gradientColors = null;
    #backgroundColor = "#000000";
    #innerGlowColor = null;
    #innerGlowBlur = 0;
    #measureCanvas = document.createElement("canvas");
    #measureCtx = this.#measureCanvas.getContext("2d");

    constructor(width, height) {
        this.#width = width;
        this.#height = height;
    }

    static create(width, height) {
        return new TypographyBuilder(width, height);
    }

    // --- Public Setters ---

    /**
     * Sets the text to render.
     * @param {string} text - The text to render.
     * @returns {TypographyBuilder}
     */
    text(text) {
        this.#text = text;
        return this;
    }

    /**
     * Sets the font family.
     * @param {string} fontFamily - The font family (e.g., "Arial").
     * @returns {TypographyBuilder}
     */
    fontFamily(fontFamily) {
        this.#fontFamily = fontFamily;
        return this;
    }

    /**
     * Sets the font size in pixels.
     * @param {number} fontSize - The font size in pixels.
     * @returns {TypographyBuilder}
     */
    fontSize(fontSize) {
        this.#fontSize = fontSize;
        this.#isFontSizeAuto = false;
        return this;
    }

    /**
     * Enables automatic font size calculation.
     * @param {boolean} [enable=true] - Whether to enable auto font size.
     * @returns {TypographyBuilder}
     */
    autoFontSize(enable = true) {
        this.#isFontSizeAuto = enable;
        return this;
    }

    /**
     * Sets the padding around the text in pixels.
     * @param {number} padding - The padding in pixels.
     * @returns {TypographyBuilder}
     */
    padding(padding) {
        this.#padding = padding;
        return this;
    }

    /**
     * Sets the fill color.
     * @param {string} color - The color as a CSS color string.
     * @returns {TypographyBuilder}
     */
    fillStyle(color) {
        this.#fillStyle = color;
        return this;
    }

    /**
     * Sets the stroke color and width.
     * @param {string} color - The stroke color.
     * @param {number} [width=1] - The stroke width in pixels.
     * @returns {TypographyBuilder}
     */
    strokeStyle(color, width = 1) {
        this.#strokeStyle = color;
        this.#strokeWidth = width;
        return this;
    }

    /**
     * Sets the glow or shadow effect.
     * @param {string} color - The glow/shadow color.
     * @param {number} size - The glow/shadow size in pixels.
     * @param {number} [offsetX=0] - The horizontal offset in pixels.
     * @param {number} [offsetY=0] - The vertical offset in pixels.
     * @returns {TypographyBuilder}
     */
    glow(color, size, offsetX = 0, offsetY = 0) {
        this.#glowColor = color;
        this.#glowSize = size;
        this.#shadowOffsetX = offsetX;
        this.#shadowOffsetY = offsetY;
        return this;
    }

    /**
     * Sets the blur amount in pixels.
     * @param {number} amount - The blur amount in pixels.
     * @returns {TypographyBuilder}
     */
    blur(amount) {
        this.#blurAmount = amount;
        return this;
    }

    /**
     * Sets the inner glow effect.
     * @param {string} color - The inner glow color.
     * @param {number} blur - The inner glow blur radius in pixels.
     * @returns {TypographyBuilder}
     */
    innerGlow(color, blur) {
        this.#innerGlowColor = color;
        this.#innerGlowBlur = blur;
        return this;
    }

    /**
     * Sets the gradient colors.
     * @param {string[]} colors - An array of CSS color strings.
     * @returns {TypographyBuilder}
     */
    gradient(colors) {
        this.#gradientColors = colors;
        return this;
    }

    /**
     * Sets the background color.
     * @param {string} color - The background color.
     * @returns {TypographyBuilder}
     */
    background(color) {
        this.#backgroundColor = color;
        return this;
    }

    // --- Internal Helpers ---

    /**
     * @private
     * @param {string} text - The text to measure.
     * @param {number} width - The maximum width.
     * @param {number} height - The maximum height.
     * @returns {number} - The maximum font size in pixels.
     */
    #getMaxFontSize(text, width, height) {
        let fontSize = 10;
        let maxFontSize = fontSize;
        let textWidth = 0;
        let textHeight = 0;
        const ctx = this.#measureCtx;
        const padding = this.#padding;

        while (true) {
            ctx.font = `${fontSize}px ${this.#fontFamily}`;
            textWidth = ctx.measureText(text).width;
            textHeight = fontSize; // Approximate height as font size
            if (textWidth > width - padding * 2 || textHeight > height - padding * 2) {
                break;
            }
            maxFontSize = fontSize;
            fontSize += 2;
        }
        return maxFontSize;
    }

    /**
     * @private
     * @returns {string} - The CSS font string.
     */
    #getFontStr() {
        if (this.#isFontSizeAuto) {
            const maxFontSize = this.#getMaxFontSize(this.#text, this.#width, this.#height);
            return `${maxFontSize}px ${this.#fontFamily}`;
        } else {
            return `${this.#fontSize}px ${this.#fontFamily}`;
        }
    }

    /**
     * @private
     * @returns {HTMLCanvasElement}
     */
    #createCanvas() {
        // --- Output canvas ---

        const outputCanvas = document.createElement("canvas");
        outputCanvas.width = this.#width;
        outputCanvas.height = this.#height;
        const outputCtx = outputCanvas.getContext('2d');
        outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

        // --- Styled Canvas ---

        const styledCanvas = document.createElement("canvas");
        styledCanvas.width = outputCanvas.width;
        styledCanvas.height = outputCanvas.height;
        const styledCtx = styledCanvas.getContext("2d");

        // 1. Background
        styledCtx.fillStyle = this.#backgroundColor;
        styledCtx.fillRect(0, 0, styledCanvas.width, styledCanvas.height);

        // 2. Outer Glow / Drop Shadow
        if (this.#glowColor && this.#glowSize > 0) {
            styledCtx.shadowColor = this.#glowColor;
            styledCtx.shadowBlur = this.#glowSize;
            styledCtx.shadowOffsetX = this.#shadowOffsetX;
            styledCtx.shadowOffsetY = this.#shadowOffsetY;
        }

        // 3. Main Text
        styledCtx.font = this.#getFontStr();
        styledCtx.textAlign = "center";
        styledCtx.textBaseline = "middle";
        const x = styledCanvas.width / 2;
        const y = styledCanvas.height / 2;

        if (this.#gradientColors) {
            const gradient = styledCtx.createLinearGradient(0, 0, styledCanvas.width, 0);
            this.#gradientColors.forEach((color, index) => {
                gradient.addColorStop(index / (this.#gradientColors.length - 1), color);
            });
            styledCtx.fillStyle = gradient;
        } else {
            styledCtx.fillStyle = this.#fillStyle;
        }
        styledCtx.fillText(this.#text, x, y);

        if (this.#strokeWidth > 0) {
            styledCtx.strokeStyle = this.#strokeStyle;
            styledCtx.lineWidth = this.#strokeWidth;
            styledCtx.strokeText(this.#text, x, y);
        }

        // 4. Reset shadows and filters
        styledCtx.shadowColor = "transparent";
        styledCtx.shadowBlur = 0;
        styledCtx.shadowOffsetX = 0;
        styledCtx.shadowOffsetY = 0;
        styledCtx.filter = "none";

        // 5. Apply blur to entire text
        if (this.#blurAmount > 0) {
            styledCtx.filter = `blur(${this.#blurAmount}px)`;
            styledCtx.drawImage(styledCanvas, 0, 0);
            styledCtx.filter = "none";
        }

        // 6. Materialize
        outputCtx.drawImage(styledCanvas, 0, 0);

        // --- Inner glow canvas ---

        if (this.#innerGlowColor && this.#innerGlowBlur > 0) {
            // 1. Create mask (text only, no background)
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = styledCanvas.width;
            maskCanvas.height = styledCanvas.height;
            const maskCtx = maskCanvas.getContext("2d");
            maskCtx.font = this.#getFontStr();
            maskCtx.textAlign = "center";
            maskCtx.textBaseline = "middle";
            maskCtx.fillStyle = "#fff";
            maskCtx.fillText(this.#text, styledCanvas.width / 2, styledCanvas.height / 2);
            const maskData = maskCtx.getImageData(0, 0, styledCanvas.width, styledCanvas.height);

            // 2. Create glow (blurred text)
            const glowCanvas = document.createElement("canvas");
            glowCanvas.width = styledCanvas.width;
            glowCanvas.height = styledCanvas.height;
            const glowCtx = glowCanvas.getContext("2d");
            glowCtx.fillStyle = this.#fillStyle;
            glowCtx.fillRect(0, 0, styledCanvas.width, styledCanvas.height);
            glowCtx.font = this.#getFontStr();
            glowCtx.textAlign = "center";
            glowCtx.textBaseline = "middle";
            glowCtx.fillStyle = this.#innerGlowColor;
            glowCtx.fillText(this.#text, styledCanvas.width / 2, styledCanvas.height / 2);

            // To blur, draw the glow onto a temporary canvas with filter
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = styledCanvas.width;
            tempCanvas.height = styledCanvas.height;
            const tempCtx = tempCanvas.getContext("2d");
            tempCtx.filter = `blur(${this.#innerGlowBlur}px)`;
            tempCtx.drawImage(glowCanvas, 0, 0);
            tempCtx.filter = "none";
            glowCtx.clearRect(0, 0, styledCanvas.width, styledCanvas.height);
            glowCtx.drawImage(tempCanvas, 0, 0);
            const glowData = glowCtx.getImageData(0, 0, styledCanvas.width, styledCanvas.height);

            // 3. Mask inner glow to the text shape
            for (let i = 0; i < glowData.data.length; i += 4) {
                if (maskData.data[i + 3] === 0) {
                    glowData.data[i + 3] = 0;
                }
            }

            // 4. Draw the masked glow over the glow canvas
            glowCtx.putImageData(glowData, 0, 0);

            // 5. Materialize
            outputCtx.drawImage(glowCanvas, 0, 0);
        }

        return outputCanvas;
    }

    // --- Public API for finalization ---

    /**
     * Materializes the typography to a canvas.
     * @returns {HTMLCanvasElement}
     */
    toCanvas() {
        return this.#createCanvas();
    }
}

export { TypographyBuilder };
