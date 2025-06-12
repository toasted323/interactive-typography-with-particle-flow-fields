import { get } from "svelte/store";

import { PerlinNoise2DTime } from "$lib/noise/PerlinNoise2DTime.js";
import { FlowNoise2DTime } from "$lib/noise/FlowNoise2DTime.js";
import { FBMNoise2DTime } from "$lib/noise/FBMNoise2DTime.js";
import { TurbulenceNoise2DTime } from "$lib/noise/TurbulenceNoise2DTime.js";

import { FpsChart } from "$apps/shared/utils/FpsChart.js";
import { HistogramChart } from "$apps/shared/utils/HistogramChart.js";
import { MinMaxChart } from "$apps/shared/utils/MinMaxChart.js";

import {
  noiseTypeStore,
  noiseTypeToStore,
  frequencyStore,
  noiseTimeScaleStore,
  noiseDirtyFlagsStore,
} from "./stores/noise.js";

import { simulationStore } from "./stores/simulation.js";
import { COLOR_MODE, uiStore } from "./stores/ui.js";

import Controls from "./Controls.svelte";

// --- Controls ---

const controls = new Controls({
  target: document.getElementById("ui"),
});

// --- Charts ---

const fpsChart = new FpsChart(document.getElementById("fps-canvas"));
const histogramChart = new HistogramChart(
  document.getElementById("histogram-canvas")
);
const minMaxChart = new MinMaxChart(document.getElementById("minmax-canvas"));

// --- Demo canvas and rendering ---

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width,
  height = canvas.height;

let currentNoiseFlags = {};
noiseDirtyFlagsStore.subscribe((flags) => {
  currentNoiseFlags = flags;
});

let noise = null;

export const noiseClasses = {
  PerlinNoise2DTime,
  FlowNoise2DTime,
  FBMNoise2DTime,
  TurbulenceNoise2DTime,
};

function instantiateNoiseIfNeeded() {
  const noiseType = get(noiseTypeStore);
  const paramsStore = noiseTypeToStore[noiseType];
  if (!paramsStore) throw new Error("Unknown noise type: " + noiseType);

  const params = get(paramsStore);
  const flags = get(noiseDirtyFlagsStore);
  if (flags[noiseType] || flags.noiseType) {
    let instance;
    if (
      noiseType === "FBMNoise2DTime" ||
      noiseType === "TurbulenceNoise2DTime"
    ) {
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

      const OctaveNoiseClass = noiseClasses[noiseType];
      instance = new OctaveNoiseClass(baseNoise, octaveParams);
    } else {
      const NoiseClass = noiseClasses[noiseType];
      instance = new NoiseClass(params);
    }

    instance.setTime(state.t * get(noiseTimeScaleStore) * get(frequencyStore));

    noise = instance;
    noiseDirtyFlagsStore.clear(noiseType);
    noiseDirtyFlagsStore.clear("noiseType");
  }
}

const state = {
  t: 0,
  noiseValues: [],
};

function update(now, dt) {
  instantiateNoiseIfNeeded();

  const { animating, speed, useAdvanceTime } = get(simulationStore);
  const frequency = get(frequencyStore);
  const noiseTimeScale = get(noiseTimeScaleStore);

  if (animating) {
    const newT = state.t + dt * speed;
    state.t = newT;

    if (useAdvanceTime) {
      noise.advanceTime(dt * speed * noiseTimeScale * frequency);
    } else {
      noise.setTime(newT * noiseTimeScale * frequency);
    }
  }

  let noiseValues = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = noise.getValue(x * frequency, y * frequency);
      noiseValues.push(value);
    }
  }

  histogramChart.update(noiseValues);

  const min = noiseValues.reduce((a, b) => Math.min(a, b), Infinity);
  const max = noiseValues.reduce((a, b) => Math.max(a, b), -Infinity);
  minMaxChart.record(min, max);

  state.noiseValues = noiseValues;

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
  const noiseValues = state.noiseValues;
  const frequency = get(frequencyStore);
  const noiseTimeScale = get(noiseTimeScaleStore);
  const { colorMode, showScaleVisualization } = get(uiStore);

  const img = ctx.createImageData(width, height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = noiseValues[y * width + x];

      let r, g, b;
      switch (colorMode) {
        case COLOR_MODE.HEIGHT_BANDS: {
          const bands = 12;
          const bandIndex = Math.floor(((value + 1) / 2) * bands);
          const isBlack = bandIndex % 2 === 0;
          r = g = b = isBlack ? 0 : 255;
          break;
        }
        case COLOR_MODE.GEOGRAPHICAL: {
          if (value >= 0) {
            r = 0;
            g = Math.floor(127.5 + 127.5 * value);
            b = 0;
          } else {
            r = 0;
            g = 0;
            b = Math.floor(127.5 - 127.5 * value);
          }
          break;
        }
        case COLOR_MODE.GRAYSCALE:
        default: {
          const c = Math.floor(127.5 * (value + 1));
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

  histogramChart.draw();
  minMaxChart.draw();
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
