import { Pane } from "tweakpane";

import { TypographyBuilder } from "$lib/typography/TypographyBuilder.js";

// --- State ---

const state = {
  text: "Hello World",
  fontFamily: "Arial",
  fontSizeAuto: true,
  fontSizeManual: 48,
  padding: 20,
  fillStyle: "#0000ff",
  strokeStyle: "#000099", // Darker blue
  strokeWidth: 3,
  glowColor: "#0000cc", // Medium blue glow
  glowSize: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  blurAmount: 3,
  innerGlowColor: "#000044", // Dark blue inner glow
  innerGlowBlur: 0,
  backgroundColor: "#000000", // Black background
  gradientColors: ["#000066", "#0000ff", "#000066"], // Dark to bright to dark blue gradient
  useGradient: false,
};

// --- UI setup ---

const pane = new Pane({ container: document.getElementById("ui") });

const textFolder = pane.addFolder({ title: "Text", expanded: true });
textFolder.addBinding(state, "text");
textFolder.addBinding(state, "fontFamily", {
  options: {
    Arial: "Arial",
    Verdana: "Verdana",
    "Times New Roman": "Times New Roman",
  },
});
const autoFontSizeBinding = textFolder.addBinding(state, "fontSizeAuto", {
  label: "Auto Font Size",
});
const paddingBinding = textFolder.addBinding(state, "padding", {
  min: 0,
  max: 100,
  step: 1,
  label: "Padding for Auto Font Size",
});
const manualFontSizeBinding = textFolder.addBinding(state, "fontSizeManual", {
  min: 8,
  max: 200,
  step: 1,
  label: "Manual Font Size",
});

paddingBinding.disabled = !state.fontSizeAuto;
manualFontSizeBinding.disabled = state.fontSizeAuto;

const fillStrokeFolder = pane.addFolder({
  title: "Fill & Stroke",
  expanded: true,
});
fillStrokeFolder.addBinding(state, "fillStyle");
fillStrokeFolder.addBinding(state, "strokeStyle");
fillStrokeFolder.addBinding(state, "strokeWidth", { min: 0, max: 10, step: 1 });
fillStrokeFolder.addBinding(state, "useGradient", {
  label: "Use Gradient Fill",
});
fillStrokeFolder.addBinding(state.gradientColors, "0", {
  label: "Gradient Color 1",
});
fillStrokeFolder.addBinding(state.gradientColors, "1", {
  label: "Gradient Color 2",
});
fillStrokeFolder.addBinding(state.gradientColors, "2", {
  label: "Gradient Color 3",
});

const glowFolder = pane.addFolder({ title: "Glow & Shadow", expanded: true });
glowFolder.addBinding(state, "glowColor");
glowFolder.addBinding(state, "glowSize", { min: 0, max: 100, step: 1 });
glowFolder.addBinding(state, "shadowOffsetX", { min: -50, max: 50, step: 1 });
glowFolder.addBinding(state, "shadowOffsetY", { min: -50, max: 50, step: 1 });

const blurFolder = pane.addFolder({ title: "Blur", expanded: true });
blurFolder.addBinding(state, "blurAmount", { min: 0, max: 50, step: 1 });

const innerGlowFolder = pane.addFolder({ title: "Inner Glow", expanded: true });
innerGlowFolder.addBinding(state, "innerGlowColor");
innerGlowFolder.addBinding(state, "innerGlowBlur", {
  min: 0,
  max: 50,
  step: 1,
});

const bgFolder = pane.addFolder({ title: "Background", expanded: true });
bgFolder.addBinding(state, "backgroundColor");

autoFontSizeBinding.on("change", (ev) => {
  paddingBinding.disabled = !ev.value;
  manualFontSizeBinding.disabled = ev.value;
});

// --- Demo canvas and rendering ---

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");

function render() {
  // Build builder instance
  const builder = TypographyBuilder.create(canvas.width, canvas.height)
    .text(state.text)
    .fontFamily(state.fontFamily)
    .padding(state.padding);

  // Set font size mode
  if (state.fontSizeAuto) {
    builder.autoFontSize(true);
  } else {
    builder.fontSize(state.fontSizeManual);
  }

  // Set other properties
  builder
    .fillStyle(state.fillStyle)
    .strokeStyle(state.strokeStyle, state.strokeWidth)
    .glow(
      state.glowColor,
      state.glowSize,
      state.shadowOffsetX,
      state.shadowOffsetY
    )
    .blur(state.blurAmount)
    .innerGlow(state.innerGlowColor, state.innerGlowBlur)
    .background(state.backgroundColor);

  if (state.useGradient) {
    builder.gradient(state.gradientColors);
  }

  // Draw to canvas
  const renderedCanvas = builder.toCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(renderedCanvas, 0, 0);
}

pane.on("change", () => render());
render();
