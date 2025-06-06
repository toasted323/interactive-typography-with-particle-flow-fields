import { Pane } from "tweakpane";

import { FpsChart } from "$core/utils/FpsChart.js";
import { HistogramChart } from "$core/utils/HistogramChart.js";
import { MinMaxChart } from "$core/utils/MinMaxChart.js";

import { PerlinNoise2DTime } from "$core/noise/PerlinNoise2DTime.js";
import { FlowNoise2DTime } from "$core/noise/FlowNoise2DTime.js";

// --- State ---

const baseNoiseParamDefs = {
  PerlinNoise2DTime: [
    { key: "seed", options: { step: 1, min: 0, max: 4294967295 } },
  ],
  FlowNoise2DTime: [
    { key: "seed", options: { step: 1, min: 0, max: 4294967295 } },
    { key: "spinVariation", options: { min: 0, max: 1, step: 0.01 } },
    { key: "N", options: { min: 1, max: 512, step: 1 } },
  ],
};

const defaultBaseParams = {
  PerlinNoise2DTime: { seed: 0 },
  FlowNoise2DTime: { seed: 0, spinVariation: 0.2, N: 128 },
};

function getDefaultState() {
  return {
    PerlinNoise2DTime: { ...defaultBaseParams.PerlinNoise2DTime },
    FlowNoise2DTime: { ...defaultBaseParams.FlowNoise2DTime },
    noiseType: "PerlinNoise2DTime",

    frequency: 0.05,
    noiseSpeed: 20.0,
    showScaleVisualization: true,

    animating: true,
    t: 0,
    speed: 1.0,
    useAdvanceTime: false,

    colorMode: "grayscale",
  };
}

let state = getDefaultState();

const noiseClasses = {
  PerlinNoise2DTime: PerlinNoise2DTime,
  FlowNoise2DTime: FlowNoise2DTime,
};

// --- UI setup ---

const pane = new Pane({ container: document.getElementById("ui") });

let updateNoiseFolderVisibility;
{
  // Noise
  pane.addBinding(state, "noiseType", {
    options: {
      PerlinNoise2DTime: "PerlinNoise2DTime",
      FlowNoise2DTime: "FlowNoise2DTime",
    },
  });

  const noiseParamFolders = {};

  // Perlin
  const perlinFolder = pane.addFolder({ title: "PerlinNoise2DTime Params" });
  perlinFolder.addBinding(
    state.PerlinNoise2DTime,
    "seed",
    baseNoiseParamDefs.PerlinNoise2DTime[0].options
  );
  noiseParamFolders.PerlinNoise2DTime = perlinFolder;

  // Flow
  const flowFolder = pane.addFolder({ title: "FlowNoise2DTime Params" });
  for (const def of baseNoiseParamDefs.FlowNoise2DTime) {
    flowFolder.addBinding(state.FlowNoise2DTime, def.key, def.options);
  }
  noiseParamFolders.FlowNoise2DTime = flowFolder;

  updateNoiseFolderVisibility = function () {
    for (const key in noiseParamFolders) {
      noiseParamFolders[key].hidden = key !== state.noiseType;
    }
  };

  updateNoiseFolderVisibility();
  pane.on("change", () => setTimeout(updateNoiseFolderVisibility, 0));
}

{
  // General params
  pane.addBinding(state, "frequency", { min: 0.001, max: 1, step: 0.001 });
  pane.addBinding(state, "noiseSpeed", {
    min: 0.1,
    max: 1000,
    step: 0.1,
    label: "Noise Speed",
  });
  pane.addBinding(state, "showScaleVisualization", {
    label: "Show Scale Visualization",
  });

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

{
  // Actions
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
const histogramChart = new HistogramChart(
  document.getElementById("histogram-canvas")
);
const minMaxChart = new MinMaxChart(document.getElementById("minmax-canvas"));

// --- Demo canvas and rendering ---

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width,
  height = canvas.height;

let noise = null;
let lastNoiseType = null;
let lastNoiseParams = {};

function instantiateNoiseIfNeeded() {
  const noiseType = state.noiseType;
  const params = { ...state[noiseType] };
  const paramsChanged =
    JSON.stringify(params) !== JSON.stringify(lastNoiseParams);
  if (!noise || noiseType !== lastNoiseType || paramsChanged) {
    const NoiseClass = noiseClasses[noiseType];
    noise = new NoiseClass(params);
    lastNoiseType = noiseType;
    lastNoiseParams = params;
    noise.setTime(state.t * state.frequency);
  }
}

function update(now, dt) {
  instantiateNoiseIfNeeded();

  if (state.animating) {
    if (state.useAdvanceTime) {
      noise.advanceTime(dt * state.speed * state.noiseSpeed * state.frequency);
      state.t += dt * state.speed;
    } else {
      state.t += dt * state.speed;
      noise.setTime(state.t * state.noiseSpeed * state.frequency);
    }
  }

  let noiseValues = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = noise.getValue(x * state.frequency, y * state.frequency);
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
  let noiseValues = state.noiseValues;
  const img = ctx.createImageData(width, height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = noiseValues[y * width + x];

      let r, g, b;
      switch (state.colorMode) {
        case "heightbands": {
          const bands = 12;
          const bandIndex = Math.floor(((value + 1) / 2) * bands);
          const isBlack = bandIndex % 2 === 0;
          r = g = b = isBlack ? 0 : 255;
          break;
        }
        case "geographical": {
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
        case "grayscale":
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

  if (state.showScaleVisualization) {
    renderGrid(ctx, width, height, state.frequency);
    const period = 1 / (state.frequency * state.noiseSpeed);
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
