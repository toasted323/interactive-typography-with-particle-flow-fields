import { get } from "svelte/store";

import { buildTypographyCanvas } from "$lib/typography/build-typography-canvas.js";
import { ImageDataAdapter } from "$lib/layers/image-data-adapter.js";

import { NullNoise2DTime } from "$lib/noise/null-noise-2d-time.js";
import { instantiateNoise } from "$lib/noise/instantiate-noise.js";
import { NoiseAdapter } from "$lib/layers/noise-adapter.js";

import { LayerStack } from "$lib/layers/layer-stack.js";
import { MaskDecoratorCircle } from "$lib/layers/mask-decorator-circle.js";
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

import { FpsChart } from "$apps/shared/utils/fps-chart.js";

import { layerStackStore } from "./stores/layer-stack.js";
import { maskLayerStore } from "./stores/mask-layer.js";
import {
  noiseLayerStore,
  noiseLayerDirtyFlagStore,
  noiseTypeStore,
  noiseTypeToStore,
  noiseDirtyFlagsStore,
} from "./stores/noise-layer.js";
import {
  typographyLayerStore,
  typographyLayerDirtyFlagStore,
  typographyStore,
  typographyDirtyFlagStore,
} from "./stores/typography-layer.js";
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

function updateTypography() {
  const layerParams = get(typographyLayerStore);
  typographyLayer.enabled = layerParams.enabled;

  if (typographyLayer.enabled) {
    // Layer
    if (get(typographyLayerDirtyFlagStore)) {
      typographyLayer.gain = layerParams.gain;
      typographyLayerDirtyFlagStore.clear();
    }

    // Typography
    if (get(typographyDirtyFlagStore)) {
      const typographyParams = get(typographyStore);
      const typographyCanvas = buildTypographyCanvas(
        typographyParams,
        canvas.width,
        canvas.height
      );
      typographyLayer.imageData = typographyCanvas
        .getContext("2d")
        .getImageData(0, 0, width, height);

      typographyDirtyFlagStore.clear();
    }
  }
}

updateTypography();

// Noise layer
let noise = new NullNoise2DTime();

const noiseLayerParams = get(noiseLayerStore);
const noiseLayer = new NoiseAdapter(
  noise,
  noiseLayerParams.enabled,
  noiseLayerParams.gain,
  noiseLayerParams.frequency,
  noiseLayerParams.noiseTimeScale
);

function updateNoise() {
  const noiseLayerParams = get(noiseLayerStore);
  noiseLayer.enabled = noiseLayerParams.enabled;

  if (noiseLayer.enabled) {
    // Layer
    if (get(noiseLayerDirtyFlagStore)) {
      noiseLayer.gain = noiseLayerParams.gain;
      noiseLayer.frequency = noiseLayerParams.frequency;
      noiseLayer.noiseTimeScale = noiseLayerParams.noiseTimeScale;
      noiseLayerDirtyFlagStore.clear();
    }

    // Noise
    const noiseType = get(noiseTypeStore);
    const noiseStore = noiseTypeToStore[noiseType];
    if (!noiseStore) throw new Error("Unknown noise type: " + noiseType);

    const flags = get(noiseDirtyFlagsStore);
    if (flags[noiseType] || flags.noiseType) {
      // The noiseType or a parameter of the current noiseType changed
      const noiseParams = get(noiseStore);
      noise = instantiateNoise(noiseType, noiseParams);
      noiseLayer.attachNoise(noise);
      noiseDirtyFlagsStore.clear(noiseType);
      noiseDirtyFlagsStore.clear("noiseType");
    }
  }
}

updateNoise();

// Noise layer mask
const maskLayerParams = get(maskLayerStore);

const maskLayer = new MaskDecoratorCircle(noiseLayer, {
  enableMasking: maskLayerParams.enableMasking,
  radius: maskLayerParams.radius,
  fadeOutDuration: maskLayerParams.fadeOutDuration,
  autoFadeDuration: maskLayerParams.autoFadeDuration,
});

let isMouseDown = false;

function handleMouseDown(ev) {
  if (!maskLayer.enabled || !maskLayer.enableMasking) return;
  isMouseDown = true;
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * width;
  const y = ((ev.clientY - rect.top) / rect.height) * height;
  maskLayer.activate(x, y, state.t);
}

function handleMouseMove(ev) {
  if (!maskLayer.enabled || !maskLayer.enableMasking) return;
  if (!isMouseDown) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((ev.clientX - rect.left) / rect.width) * width;
  const y = ((ev.clientY - rect.top) / rect.height) * height;
  maskLayer.update(x, y, state.t);
}

function handleMouseUp(ev) {
  if (!maskLayer.enabled || !maskLayer.enableMasking) return;
  if (!isMouseDown) return;
  isMouseDown = false;
  maskLayer.deactivate(state.t);
}

function addMaskListeners() {
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
}

function removeMaskListeners() {
  canvas.removeEventListener("mousedown", handleMouseDown);
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("mouseup", handleMouseUp);
}

let maskListenersAttached = false;

function updateMask() {
  const maskLayerParams = get(maskLayerStore);
  maskLayer.enableMasking = maskLayerParams.enableMasking;
  maskLayer.radius = maskLayerParams.radius;
  maskLayer.fadeOutDuration = maskLayerParams.fadeOutDuration;
  maskLayer.autoFadeDuration = maskLayerParams.autoFadeDuration;

  if (maskLayer.enableMasking && !maskListenersAttached) {
    addMaskListeners();
    maskListenersAttached = true;
  } else if (!maskLayer.enableMasking && maskListenersAttached) {
    removeMaskListeners();
    maskListenersAttached = false;
  }
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

  updateTypography();
  updateNoise();
  updateMask();

  const { animating, timeScale, useAdvanceTime } = get(simulationStore);

  if (animating) {
    const newT = state.t + dt * timeScale;
    state.t = newT;

    if (useAdvanceTime) {
      stack.advanceTime(dt * timeScale);
    } else {
      stack.setTime(newT);
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
