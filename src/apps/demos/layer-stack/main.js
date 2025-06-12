import { get } from "svelte/store";

import { TypographyBuilder } from "$lib/typography/TypographyBuilder.js";
import { ImageDataAdapter } from "$lib/layers/ImageDataAdapter.js";

import { PerlinNoise2DTime } from "$lib/noise/PerlinNoise2DTime.js";
import { FlowNoise2DTime } from "$lib/noise/FlowNoise2DTime.js";
import { FBMNoise2DTime } from "$lib/noise/FBMNoise2DTime.js";
import { TurbulenceNoise2DTime } from "$lib/noise/TurbulenceNoise2DTime.js";
import { NoiseAdapter } from "$lib/layers/NoiseAdapter.js";

import { LayerStack } from "$lib/layers/LayerStack.js";
import { MaskDecoratorCircle } from "$lib/layers/MaskDecoratorCircle.js";
import {
  additiveBlending,
  subtractBlending,
  multiplyBlending,
  screenBlending,
  overlayBlending,
  maxBlending,
  minBlending,
  averageBlending,
} from "$lib/layers/blending.js";

import { FpsChart } from "$apps/shared/utils/FpsChart.js";

import { layerStackStore } from "./stores/layerStack.js";
import { maskLayerStore } from "./stores/maskLayer.js";
import {
  noiseLayerStore,
  noiseTypeStore,
  noiseTypeToStore,
  noiseDirtyFlagsStore,
} from "./stores/noiseLayer.js";
import {
  typographyLayerStore,
  typographyStore,
} from "./stores/typographyLayer.js";
import { simulationStore } from "./stores/simulation.js";
import { COLOR_MODE, uiStore } from "./stores/ui.js";

import Controls from "./Controls.svelte";

// --- Controls ---

const controls = new Controls({
  target: document.getElementById("ui"),
});

// --- Charts ---

const fpsChart = new FpsChart(document.getElementById("fps-canvas"));

// --- Demo canvas updating and rendering ---

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width,
  height = canvas.height;

const state = {
  t: 0,
};

// Typography layer
const blankImageData = new ImageData(width, height);
const typographyLayer = new ImageDataAdapter(
  blankImageData,
  width,
  height,
  true,
  1,
  2
);

let typographyDirty = true;
typographyLayerStore.subscribe((value) => {
  typographyDirty = true;
});
typographyStore.subscribe((value) => {
  typographyDirty = true;
});
function renderTypographyIfNeeded() {
  if (typographyDirty) {
    const layerParams = get(typographyLayerStore);
    const typographyParams = get(typographyStore);
    const p = { ...layerParams, ...typographyParams };

    typographyLayer.enabled = p.enabled;
    if (typographyLayer.enabled) {
      typographyLayer.gain = p.gain;

      const builder = TypographyBuilder.create(width, height)
        .text(p.text)
        .fontFamily(p.fontFamily)
        .padding(p.padding)
        .fillStyle(p.fillStyle)
        .strokeStyle(p.strokeStyle, p.strokeWidth)
        .background(p.backgroundColor)
        .glow(p.glowColor, p.glowSize, p.shadowOffsetX, p.shadowOffsetY)
        .blur(p.blurAmount)
        .innerGlow(p.innerGlowColor, p.innerGlowBlur);

      if (p.useGradient) {
        builder.gradient(p.gradientColors);
      }
      if (p.fontSizeAuto) {
        builder.autoFontSize(true);
      } else {
        builder.fontSize(p.fontSizeManual);
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
let currentNoiseFlags = {};
noiseDirtyFlagsStore.subscribe((flags) => {
  currentNoiseFlags = flags;
});

let noise = null;
let noiseLayer = null;

const noiseClasses = {
  PerlinNoise2DTime,
  FlowNoise2DTime,
  FBMNoise2DTime,
  TurbulenceNoise2DTime,
};

function instantiateNoiseIfNeeded() {
  const type = get(noiseTypeStore);
  const store = noiseTypeToStore[type];
  if (!store) throw new Error("Unknown noise type: " + type);

  const params = get(store);
  const flags = currentNoiseFlags;

  if (flags[type] || flags.noiseType) {
    let instance;
    if (type === "FBMNoise2DTime" || type === "TurbulenceNoise2DTime") {
      const baseType = params.baseType;
      const baseParams =
        baseType === "PerlinNoise2DTime"
          ? params.perlinBaseParams
          : params.flowBaseParams;

      const BaseNoiseClass = noiseClasses[baseType];
      if (!BaseNoiseClass)
        throw new Error("Unknown base noise type: " + baseType);

      const baseNoise = new BaseNoiseClass(baseParams);

      const octaveParams = {
        octaves: params.octaves,
        persistence: params.persistence,
        lacunarity: params.lacunarity,
      };

      const OctaveNoiseClass = noiseClasses[type];
      instance = new OctaveNoiseClass(baseNoise, octaveParams);
    } else {
      const NoiseClass = noiseClasses[type];
      instance = new NoiseClass(params);
    }

    const { frequency, noiseTimeScale } = get(noiseLayerStore);
    instance.setTime(state.t * frequency * noiseTimeScale);

    noise = instance;
    noiseDirtyFlagsStore.clear(type);
    noiseDirtyFlagsStore.clear("noiseType");
  }
}
instantiateNoiseIfNeeded();

// Noise layer
const noiseLayerParams = get(noiseLayerStore);
noiseLayer = new NoiseAdapter(
  noise,
  noiseLayerParams.enabled,
  noiseLayerParams.gain,
  noiseLayerParams.frequency,
  noiseLayerParams.noiseTimeScale
);

// Noise layer mask
const maskLayerParams = get(maskLayerStore);

const maskLayer = new MaskDecoratorCircle(noiseLayer, {
  enableMasking: maskLayerParams.enableMasking,
  radius: maskLayerParams.radius,
  fadeOutDuration: maskLayerParams.fadeOutDuration,
  autoFadeDuration: maskLayerParams.autoFadeDuration,
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

// Layer stack
const blendingFunctions = {
  additive: additiveBlending,
  subtract: subtractBlending,
  multiply: multiplyBlending,
  screen: screenBlending,
  overlay: overlayBlending,
  max: maxBlending,
  min: minBlending,
  average: averageBlending,
};

const stack = new LayerStack(
  [typographyLayer, maskLayer],
  blendingFunctions[get(layerStackStore).blendingMode]
);

// Main loop
function update(now, dt) {
  stack.blendingFunc = blendingFunctions[get(layerStackStore).blendingMode];

  renderTypographyIfNeeded();
  instantiateNoiseIfNeeded();

  const noiseLayerParams = get(noiseLayerStore);
  noiseLayer.noise = noise;
  noiseLayer.enabled = noiseLayerParams.enabled;
  noiseLayer.gain = noiseLayerParams.gain;
  noiseLayer.frequency = noiseLayerParams.frequency;
  noiseLayer.noiseTimeScale = noiseLayerParams.noiseTimeScale;

  if (noiseLayer.enabled) {
    noiseLayer.setTime(state.t);
  }

  const maskLayerParams = get(maskLayerStore);
  maskLayer.enableMasking = maskLayerParams.enableMasking;
  maskLayer.radius = maskLayerParams.radius;
  maskLayer.fadeOutDuration = maskLayerParams.fadeOutDuration;
  maskLayer.autoFadeDuration = maskLayerParams.autoFadeDuration;

  const { animating, timeScale, useAdvanceTime } = get(simulationStore);
  const { frequency, noiseTimeScale } = get(noiseLayerStore);

  if (animating) {
    const newT = state.t + dt * timeScale;
    state.t = newT;

    if (useAdvanceTime) {
      stack.advanceTime(dt * timeScale * noiseTimeScale * frequency);
    } else {
      stack.setTime(newT * noiseTimeScale * frequency);
    }
  }

  fpsChart.record(now);
}

function renderGrid(
  ctx,
  width,
  height,
  frequency,
  color = "rgba(255, 255, 255, 0.2)"
) {
  const cellSize = 1 / frequency;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Vertical lines
  for (let x = 0; x < width; x += cellSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  // Horizontal lines
  for (let y = 0; y < height; y += cellSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

function renderPieChart(
  ctx,
  x,
  y,
  radius,
  progress,
  color = "rgba(255, 0, 0, 0.5)"
) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function render() {
  const { frequency, noiseTimeScale } = get(noiseLayerStore);
  const { colorMode, showScaleVisualization } = get(uiStore);

  const img = ctx.createImageData(width, height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = stack.getValue(x, y);
      let r, g, b;
      switch (colorMode) {
        case COLOR_MODE.HEIGHT_BANDS: {
          const bands = 12;
          const bandIndex = Math.floor(value * bands);
          const isBlack = bandIndex % 2 === 0;
          r = g = b = isBlack ? 0 : 255;
          break;
        }
        case COLOR_MODE.GEOGRAPHICAL: {
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
        case COLOR_MODE.GRAYSCALE:
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

  if (showScaleVisualization) {
    renderGrid(ctx, width, height, frequency);
    const period = 1 / (frequency * noiseTimeScale);
    const progress = (state.t % period) / period;
    renderPieChart(ctx, width - 50, 50, 20, progress);
  }

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
