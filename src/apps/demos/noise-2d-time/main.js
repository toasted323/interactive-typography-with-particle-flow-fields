import { get } from "svelte/store";

import { instantiateNoise } from "$lib/noise/instantiate-noise.js";

import { FpsChart } from "$apps/shared/utils/fps-chart.js";
import { HistogramChart } from "$apps/shared/utils/histogram-chart.js";
import { MinMaxChart } from "$apps/shared/utils/min-max-chart.js";

import {
  noiseTypeStore,
  noiseTypeToStore,
  noiseDirtyFlagsStore,
} from "$apps/shared/stores/noise.js";
import { noiseSamplingStore } from "$apps/shared/stores/noise-sampling.js";

import { simulationStore } from "$apps/shared/stores/simulation.js";

import { COLOR_MODE, uiStore } from "$apps/shared/stores/ui.js";

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

const state = {
  t: 0,
  noiseValues: [],
};

let currentNoiseFlags = {};
noiseDirtyFlagsStore.subscribe((flags) => {
  currentNoiseFlags = flags;
});

let noise = null;

function instantiateNoiseIfNeeded() {
  const noiseType = get(noiseTypeStore);
  const paramsStore = noiseTypeToStore[noiseType];
  if (!paramsStore) throw new Error("Unknown noise type: " + noiseType);

  const params = get(paramsStore);
  const flags = get(noiseDirtyFlagsStore);
  if (flags[noiseType] || flags.noiseType) {
    noise = instantiateNoise(noiseType, params);
    noiseDirtyFlagsStore.clear(noiseType);
    noiseDirtyFlagsStore.clear("noiseType");

    const { frequency: noiseFrequency, timeScale: noiseTimeScale } =
        get(noiseSamplingStore);
    noise.setTime(state.t * noiseTimeScale * noiseFrequency);
  }
}

function update(now, dt) {
  instantiateNoiseIfNeeded();

  const {
    animating,
    timeScale: simTimeScale,
    useAdvanceTime,
  } = get(simulationStore);

  if (animating) {
    const newT = state.t + dt * simTimeScale;
    state.t = newT;

    const { frequency: noiseFrequency, timeScale: noiseTimeScale } =
        get(noiseSamplingStore);
    if (useAdvanceTime) {
      noise.advanceTime(dt * simTimeScale * noiseTimeScale * noiseFrequency);
    } else {
      noise.setTime(newT * noiseTimeScale * noiseFrequency);
    }

    let noiseValues = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const value = noise.getValue(x * noiseFrequency, y * noiseFrequency);
        noiseValues.push(value);
      }
    }

    histogramChart.update(noiseValues);

    const min = noiseValues.reduce((a, b) => Math.min(a, b), Infinity);
    const max = noiseValues.reduce((a, b) => Math.max(a, b), -Infinity);
    minMaxChart.record(min, max);

    state.noiseValues = noiseValues;
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
  const noiseValues = state.noiseValues;
  const { frequency: noiseFrequency, timeScale: noiseTimeScale } =
    get(noiseSamplingStore);

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
    renderGrid(ctx, width, height, noiseFrequency);
    const period = 1 / (noiseFrequency * noiseTimeScale);
    const progress = (state.t % period) / period;
    renderPieChart(ctx, width - 50, 50, 20, progress);
  }

  histogramChart.draw();
  minMaxChart.draw();
  fpsChart.draw();
}

let lastNow;
let firstFrame = true;

function loop(now) {
  if (firstFrame) {
    lastNow = now;
    firstFrame = false;
    requestAnimationFrame(loop);
    return;
  }
  const dt = (now - lastNow) / 1000;
  lastNow = now;
  update(now, dt);
  render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
