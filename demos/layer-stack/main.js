import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";

import { FpsChart } from "../../src/utils/FpsChart.js";

import { TypographyBuilder } from "../../src/typography/TypographyBuilder.js";
import { ImageDataAdapter } from "../../src/layers/adapters/ImageDataAdapter.js";

import { PerlinNoise2DTime } from "../../src/noise/PerlinNoise2DTime.js";
import { FlowNoise2DTime } from "../../src/noise/FlowNoise2DTime.js";
import { NoiseAdapter } from "../../src/layers/adapters/NoiseAdapter.js";

import { MaskDecoratorCircle } from "../../src/layers/stack/MaskDecoratorCircle.js";

import { LayerStack } from "../../src/layers/stack/LayerStack.js";

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width,
  height = canvas.height;

// --- State ---

const defaultNoiseLayerParams = {
  enabled: true,
  type: "PerlinNoise2DTime",
  PerlinNoise2DTime: { seed: 0 },
  FlowNoise2DTime: { seed: 0, spinVariation: 0.2, N: 128 },
  frequency: 0.05,
  noiseSpeed: 20.0,
  gain: 1,
};

const defaultTypographyLayerParams = {
  enabled: true,

  // Text
  text: "Layer Stack",
  fontFamily: "Arial",
  fontSizeAuto: true,
  fontSizeManual: 48,
  padding: 60,

  // Fill & stroke
  fillStyle: "#0000ff",
  strokeStyle: "#000099",
  strokeWidth: 3,
  useGradient: false,
  gradientColors: ["#000066", "#0000ff", "#000066"],

  // Glow & shadow
  glowColor: "#0000cc",
  glowSize: 10,
  shadowOffsetX: 0,
  shadowOffsetY: 0,

  // Blur
  blurAmount: 3,

  // Inner glow
  innerGlowColor: "#000044",
  innerGlowBlur: 0,

  // Background
  backgroundColor: "#000000",
};

function getDefaultState() {
  return {
    // Noise layer mask
    maskLayer: {
      enableMasking: true,
      radius: 100,
      fadeOutDuration: 1.0,
      autoFadeDuration: 1.0,
    },

    // Noise layer
    noiseLayer: { ...defaultNoiseLayerParams },

    // Typography layer
    typographyLayer: { ...defaultTypographyLayerParams },

    // Main
    animating: true,
    t: 0,
    speed: 1.0,
    useAdvanceTime: false,

    colorMode: "grayscale",
  };
}

let state = getDefaultState();

const noiseClasses = {
  PerlinNoise2DTime,
  FlowNoise2DTime,
};

// --- UI setup ---

const pane = new Pane({ container: document.getElementById("ui") });

// Noise layer mask params
{
  const maskFolder = pane.addFolder({
    title: "Noise Mask (Circle)",
    expanded: true,
  });

  maskFolder.addBinding(state.maskLayer, "enableMasking", {
    label: "Masking Enabled",
  });

  maskFolder.addBinding(state.maskLayer, "radius", {
    min: 1,
    max: Math.min(width, height) / 2,
    step: 1,
  });

  maskFolder.addBinding(state.maskLayer, "fadeOutDuration", {
    min: 0.01,
    max: 10,
    step: 0.01,
    label: "Fade Out Duration (s)",
  });

  maskFolder.addBinding(state.maskLayer, "autoFadeDuration", {
    min: 0.01,
    max: 10,
    step: 0.01,
    label: "Auto Fade Delay (s)",
  });
}

// Noise layer params
let updateNoiseFolderVisibility;
{
  const noiseLayerFolder = pane.addFolder({
    title: "Noise Layer Params",
    expanded: true,
  });

  noiseLayerFolder.addBinding(state.noiseLayer, "enabled", {
    label: "Layer Enabled",
  });

  // Noise type selector
  noiseLayerFolder.addBinding(state.noiseLayer, "type", {
    options: {
      PerlinNoise2DTime: "PerlinNoise2DTime",
      FlowNoise2DTime: "FlowNoise2DTime",
    },
  });

  // Noise instance params, grouped and shown/hidden as appropriate
  const perlinFolder = noiseLayerFolder.addFolder({
    title: "PerlinNoise2DTime Params",
    expanded: false,
  });
  perlinFolder.addBinding(state.noiseLayer.PerlinNoise2DTime, "seed", {
    min: 0,
    max: 4294967295,
    step: 1,
  });

  const flowFolder = noiseLayerFolder.addFolder({
    title: "FlowNoise2DTime Params",
    expanded: false,
  });
  flowFolder.addBinding(state.noiseLayer.FlowNoise2DTime, "seed", {
    min: 0,
    max: 4294967295,
    step: 1,
  });
  flowFolder.addBinding(state.noiseLayer.FlowNoise2DTime, "spinVariation", {
    min: 0,
    max: 1,
    step: 0.01,
  });
  flowFolder.addBinding(state.noiseLayer.FlowNoise2DTime, "N", {
    min: 1,
    max: 512,
    step: 1,
  });

  // Frequency, speed, and gain
  noiseLayerFolder.addBinding(state.noiseLayer, "frequency", {
    min: 0.001,
    max: 1,
    step: 0.001,
  });
  noiseLayerFolder.addBinding(state.noiseLayer, "noiseSpeed", {
    min: 0,
    max: 1000,
    step: 0.1,
    label: "Noise Speed",
  });
  noiseLayerFolder.addBinding(state.noiseLayer, "gain", {
    min: 0,
    max: 10,
    step: 0.1,
  });

  updateNoiseFolderVisibility = function () {
    perlinFolder.hidden = state.noiseLayer.type !== "PerlinNoise2DTime";
    flowFolder.hidden = state.noiseLayer.type !== "FlowNoise2DTime";
  };
  updateNoiseFolderVisibility();
  noiseLayerFolder.on("change", updateNoiseFolderVisibility);
}

// Typography layer params
let typographyDirty = true;
{
  const typographyLayerFolder = pane.addFolder({
    title: "Typography Layer Params",
    expanded: true,
  });

  typographyLayerFolder.addBinding(state.typographyLayer, "enabled", {
    label: "Layer Enabled",
  });

  // --- Text ---
  const textFolder = typographyLayerFolder.addFolder({
    title: "Text",
    expanded: false,
  });
  textFolder.addBinding(state.typographyLayer, "text");
  textFolder.addBinding(state.typographyLayer, "fontFamily", {
    options: {
      Arial: "Arial",
      Verdana: "Verdana",
      "Times New Roman": "Times New Roman",
    },
  });
  textFolder.addBinding(state.typographyLayer, "fontSizeAuto", {
    label: "Auto Font Size",
  });
  const paddingBinding = textFolder.addBinding(
    state.typographyLayer,
    "padding",
    {
      min: 0,
      max: 200,
      step: 1,
    }
  );
  const manualFontSizeBinding = textFolder.addBinding(
    state.typographyLayer,
    "fontSizeManual",
    { min: 8, max: 200, step: 1, label: "Manual Font Size" }
  );

  // --- Fill & Stroke ---
  const fillStrokeFolder = typographyLayerFolder.addFolder({
    title: "Fill & Stroke",
    expanded: false,
  });
  fillStrokeFolder.addBinding(state.typographyLayer, "fillStyle", {
    view: "color",
  });
  fillStrokeFolder.addBinding(state.typographyLayer, "strokeStyle", {
    view: "color",
  });
  fillStrokeFolder.addBinding(state.typographyLayer, "strokeWidth", {
    min: 0,
    max: 10,
    step: 1,
  });
  fillStrokeFolder.addBinding(state.typographyLayer, "useGradient", {
    label: "Use Gradient Fill",
  });
  fillStrokeFolder.addBinding(state.typographyLayer.gradientColors, "0", {
    label: "Gradient Color 1",
    view: "color",
  });
  fillStrokeFolder.addBinding(state.typographyLayer.gradientColors, "1", {
    label: "Gradient Color 2",
    view: "color",
  });
  fillStrokeFolder.addBinding(state.typographyLayer.gradientColors, "2", {
    label: "Gradient Color 3",
    view: "color",
  });

  // --- Glow & Shadow ---
  const glowFolder = typographyLayerFolder.addFolder({
    title: "Glow & Shadow",
    expanded: false,
  });
  glowFolder.addBinding(state.typographyLayer, "glowColor", { view: "color" });
  glowFolder.addBinding(state.typographyLayer, "glowSize", {
    min: 0,
    max: 100,
    step: 1,
  });
  glowFolder.addBinding(state.typographyLayer, "shadowOffsetX", {
    min: -50,
    max: 50,
    step: 1,
  });
  glowFolder.addBinding(state.typographyLayer, "shadowOffsetY", {
    min: -50,
    max: 50,
    step: 1,
  });

  // --- Blur ---
  const blurFolder = typographyLayerFolder.addFolder({
    title: "Blur",
    expanded: false,
  });
  blurFolder.addBinding(state.typographyLayer, "blurAmount", {
    min: 0,
    max: 50,
    step: 1,
  });

  // --- Inner Glow ---
  const innerGlowFolder = typographyLayerFolder.addFolder({
    title: "Inner Glow",
    expanded: false,
  });
  innerGlowFolder.addBinding(state.typographyLayer, "innerGlowColor", {
    view: "color",
  });
  innerGlowFolder.addBinding(state.typographyLayer, "innerGlowBlur", {
    min: 0,
    max: 50,
    step: 1,
  });

  // --- Background ---
  const bgFolder = typographyLayerFolder.addFolder({
    title: "Background",
    expanded: false,
  });
  bgFolder.addBinding(state.typographyLayer, "backgroundColor", {
    view: "color",
  });

  typographyLayerFolder.on("change", (ev) => {
    paddingBinding.disabled = !state.typographyLayer.fontSizeAuto;
    manualFontSizeBinding.disabled = state.typographyLayer.fontSizeAuto;
    typographyDirty = true;
  });

  paddingBinding.disabled = !state.typographyLayer.fontSizeAuto;
  manualFontSizeBinding.disabled = state.typographyLayer.fontSizeAuto;
}

// General params
{
  pane.addBinding(state, "speed", {
    min: 0.1,
    max: 20,
    step: 0.1,
  });
  pane.addBinding(state, "useAdvanceTime", { label: "Use advanceTime()" });

  pane.addBinding(state, "colorMode", {
    label: "Color Mode",
    options: {
      Grayscale: "grayscale",
      "Height Bands": "heightbands",
      Geographical: "geographical",
    },
  });
}

// Actions
{
  const actions = pane.addFolder({ title: "Actions", expanded: true });
  actions.addButton({ title: "Pause" }).on("click", () => {
    state.animating = false;
  });
  actions.addButton({ title: "Resume" }).on("click", () => {
    state.animating = true;
  });
  const initialState = pane.exportState();
  actions.addButton({ title: "Reset to Defaults" }).on("click", () => {
    pane.importState(initialState);
    setTimeout(updateNoiseFolderVisibility, 0);
  });
}

// --- Charts ---

const fpsChart = new FpsChart(document.getElementById("fps-canvas"));

// --- Demo canvas updating and rendering ---

// Typography layer
const blankImageData = new ImageData(width, height);
const typographyLayer = new ImageDataAdapter(
  blankImageData,
  width,
  height,
  true,
  2
);

function renderTypographyIfNeeded() {
  if (typographyDirty) {
    typographyLayer.enabled = state.typographyLayer.enabled;
    if (typographyLayer.enabled) {
      const t = state.typographyLayer;
      const builder = TypographyBuilder.create(width, height)
        .text(t.text)
        .fontFamily(t.fontFamily)
        .padding(t.padding)
        .fillStyle(t.fillStyle)
        .strokeStyle(t.strokeStyle, t.strokeWidth)
        .background(t.backgroundColor)
        .glow(t.glowColor, t.glowSize, t.shadowOffsetX, t.shadowOffsetY)
        .blur(t.blurAmount)
        .innerGlow(t.innerGlowColor, t.innerGlowBlur);

      if (t.useGradient) {
        builder.gradient(t.gradientColors);
      }
      if (t.fontSizeAuto) {
        builder.autoFontSize(true);
      } else {
        builder.fontSize(t.fontSizeManual);
      }

      const typographyCanvas = builder.toCanvas();
      typographyLayer.imageData = typographyCanvas
        .getContext("2d")
        .getImageData(0, 0, width, height);
    }
    typographyDirty = false;
  }
}
renderTypographyIfNeeded();

// Noise layer
let noise = null;
let noiseLayer = null;
let lastNoiseType = null;
let lastNoiseParams = {};

function instantiateNoiseIfNeeded() {
  const noiseType = state.noiseLayer.type;
  const params = { ...state.noiseLayer[noiseType] };
  const paramsChanged =
    JSON.stringify(params) !== JSON.stringify(lastNoiseParams);

  if (!noise || noiseType !== lastNoiseType || paramsChanged) {
    const NoiseClass = noiseClasses[noiseType];
    noise = new NoiseClass(params);
    lastNoiseType = noiseType;
    lastNoiseParams = params;

    if (!noiseLayer) {
      noiseLayer = new NoiseAdapter(
        noise,
        state.noiseLayer.enabled,
        state.noiseLayer.gain,
        state.noiseLayer.frequency,
        state.noiseLayer.noiseSpeed
      );
    } else {
      noiseLayer.enabled = state.noiseLayer.enabled;
      noiseLayer.noise = noise;
      noiseLayer.gain = state.noiseLayer.gain;
      noiseLayer.frequency = state.noiseLayer.frequency;
      noiseLayer.noiseSpeed = state.noiseLayer.noiseSpeed;
    }
    if (noiseLayer.enabled) noiseLayer.setTime(state.t);
  } else {
    noiseLayer.enabled = state.noiseLayer.enabled;
    noiseLayer.gain = state.noiseLayer.gain;
    noiseLayer.frequency = state.noiseLayer.frequency;
    noiseLayer.noiseSpeed = state.noiseLayer.noiseSpeed;
  }
}
instantiateNoiseIfNeeded();

// Noise layer mask
const maskLayer = new MaskDecoratorCircle(noiseLayer, {
  enableMasking: state.maskLayer.enableMasking,
  radius: state.maskLayer.radius,
  fadeOutDuration: state.maskLayer.fadeOutDuration,
  autoFadeDuration: state.maskLayer.autoFadeDuration,
});

{
  let isMouseDown = false;

  canvas.addEventListener("mousedown", (ev) => {
    if (!maskLayer.enabled || !maskLayer.enableMasking) return;
    isMouseDown = true;
    const rect = canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * width;
    const y = ((ev.clientY - rect.top) / rect.height) * height;
    maskLayer.activate(x, y, state.t);
  });

  canvas.addEventListener("mousemove", (ev) => {
    if (!maskLayer.enabled || !maskLayer.enableMasking) return;
    if (!isMouseDown) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * width;
    const y = ((ev.clientY - rect.top) / rect.height) * height;
    maskLayer.update(x, y, state.t);
  });

  canvas.addEventListener("mouseup", (ev) => {
    if (!maskLayer.enabled || !maskLayer.enableMasking) return;
    if (!isMouseDown) return;
    isMouseDown = false;
    maskLayer.deactivate(state.t);
  });
}

const stack = new LayerStack([typographyLayer, maskLayer]);

// Main loop

function update(now, dt) {
  renderTypographyIfNeeded();
  instantiateNoiseIfNeeded();

  maskLayer.enableMasking = state.maskLayer.enableMasking;
  maskLayer.radius = state.maskLayer.radius;
  maskLayer.fadeOutDuration = state.maskLayer.fadeOutDuration;
  maskLayer.autoFadeDuration = state.maskLayer.autoFadeDuration;

  if (state.animating) {
    if (state.useAdvanceTime) {
      stack.advanceTime(dt * state.speed);
      state.t += dt * state.speed;
    } else {
      state.t += dt * state.speed;
      stack.setTime(state.t);
    }
  }

  fpsChart.record(now);
}

function render() {
  const img = ctx.createImageData(width, height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = stack.getValue(x, y);

      let r, g, b;
      switch (state.colorMode) {
        case "heightbands": {
          const bands = 12;
          const bandIndex = Math.floor(value * bands);
          const isBlack = bandIndex % 2 === 0;
          r = g = b = isBlack ? 0 : 255;
          break;
        }
        case "geographical": {
          if (value >= 0.5) {
            r = 0;
            g = Math.floor(255 * value);
            b = 0;
          } else {
            r = 0;
            g = 0;
            b = Math.floor(255 * value);
          }
          break;
        }
        case "grayscale":
        default: {
          const c = Math.floor(255 * value);
          r = g = b = c;
          break;
        }
      }

      img.data[i++] = r;
      img.data[i++] = g;
      img.data[i++] = b;
      img.data[i++] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  fpsChart.draw();
}

let lastNow = performance.now();

function loop(now = performance.now()) {
  const dt = (now - lastNow) / 1000;
  lastNow = now;
  update(now, dt);
  render();
  requestAnimationFrame(loop);
}

loop();
