import { TypographyBuilder } from "./typography-builder.js";

/**
 * Builds a canvas element containing rendered typography using the given parameters.
 *
 * @param {Object} params - Typography parameters (text, fontFamily, fontSize, padding, fillStyle, etc.).
 * @param {number} width - The width of the canvas to create.
 * @param {number} height - The height of the canvas to create.
 * @returns {HTMLCanvasElement} The canvas element with the rendered typography.
 */
export function buildTypographyCanvas(params, width, height) {
  const builder = TypographyBuilder.create(width, height)
    .text(params.text)
    .fontFamily(params.fontFamily)
    .padding(params.padding)
    .fillStyle(params.fillStyle)
    .strokeStyle(params.strokeStyle, params.strokeWidth)
    .background(params.backgroundColor)
    .glow(
      params.glowColor,
      params.glowSize,
      params.shadowOffsetX,
      params.shadowOffsetY
    )
    .blur(params.blurAmount)
    .innerGlow(params.innerGlowColor, params.innerGlowBlur);

  if (params.useGradient) {
    builder.gradient(params.gradientColors);
  }
  if (params.fontSizeAuto) {
    builder.autoFontSize(true);
  } else {
    builder.fontSize(params.fontSizeManual);
  }

  return builder.toCanvas();
}
