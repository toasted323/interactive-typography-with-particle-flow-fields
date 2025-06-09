import { TypographyBuilder } from "$lib/typography/TypographyBuilder.js";

import { typographyStore } from "./stores/typography.js";

import Controls from "./Controls.svelte";

// --- Controls ---

const controls = new Controls({
  target: document.getElementById("ui"),
});

// --- Demo canvas and rendering ---

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");

let params;

function render() {
  // Build builder instance
  const builder = TypographyBuilder.create(canvas.width, canvas.height)
    .text(params.text)
    .fontFamily(params.fontFamily)
    .padding(params.padding);

  // Set font size mode
  if (params.fontSizeAuto) {
    builder.autoFontSize(true);
  } else {
    builder.fontSize(params.fontSizeManual);
  }

  // Set other properties
  builder
    .fillStyle(params.fillStyle)
    .strokeStyle(params.strokeStyle, params.strokeWidth)
    .glow(
      params.glowColor,
      params.glowSize,
      params.shadowOffsetX,
      params.shadowOffsetY
    )
    .blur(params.blurAmount)
    .innerGlow(params.innerGlowColor, params.innerGlowBlur)
    .background(params.backgroundColor);

  if (params.useGradient) {
    builder.gradient(params.gradientColors);
  }

  // Draw to canvas
  const renderedCanvas = builder.toCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(renderedCanvas, 0, 0);
}

typographyStore.subscribe((value) => {
  params = value;
  render();
});
