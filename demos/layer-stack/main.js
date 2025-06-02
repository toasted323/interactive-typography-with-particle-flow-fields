import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js";

import { FpsChart } from "../../src/utils/FpsChart.js";

import { TypographyBuilder } from "../../src/typography/TypographyBuilder.js";
import { ImageDataAdapter } from "../../src/layers/adapters/ImageDataAdapter.js";

import { PerlinNoise2DTime } from "../../src/noise/PerlinNoise2DTime.js";
import { FlowNoise2DTime } from "../../src/noise/FlowNoise2DTime.js";
import { NoiseAdapter } from "../../src/layers/adapters/NoiseAdapter.js";

import { LayerStack } from "../../src/layers/stack/LayerStack.js";

// --- State ---

const defaultNoiseLayerParams = {
  type: "PerlinNoise2DTime",
  PerlinNoise2DTime: { seed: 0 },
  FlowNoise2DTime: { seed: 0, spinVariation: 0.2, N: 128 },
  frequency: 0.05,
  gain: 1,
};

function getDefaultState() {
  return {
    // Noise layer
    noiseLayer: { ...defaultNoiseLayerParams },

    // Main
    animating: true,
    t: 0,
    speed: 0.5,
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

// Noise layer params
let updateNoiseFolderVisibility;
{
  const noiseLayerFolder = pane.addFolder({
    title: "Noise Layer Params",
    expanded: false,
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

  // Frequency and gain
  noiseLayerFolder.addBinding(state.noiseLayer, "frequency", {
    min: 0.001,
    max: 1,
    step: 0.001,
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

// General params
{
  pane.addBinding(state, "speed", {
    min: 0.001,
    max: 2,
    step: 0.001,
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

// --- Demo canvas and rendering ---

const canvas = document.getElementById("demo-canvas");
const ctx = canvas.getContext("2d");
const width = canvas.width,
  height = canvas.height;

const typographyCanvas = TypographyBuilder.create(width, height)
  .text("Layer Stack")
  .autoFontSize()
  .padding(60)
  .fillStyle("#0000ff")
  .background("#111111")
  .glow("#000088", 30)
  .blur(5)
  .toCanvas();

const typographyImageData = typographyCanvas
  .getContext("2d")
  .getImageData(0, 0, width, height);

const typographyLayer = new ImageDataAdapter(
  typographyImageData,
  width,
  height,
  2
);

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
        state.noiseLayer.gain,
        state.noiseLayer.frequency
      );
    } else {
      noiseLayer.noise = noise;
      noiseLayer.gain = state.noiseLayer.gain;
      noiseLayer.frequency = state.noiseLayer.frequency;
    }
    noiseLayer.setTime(state.t);
  } else {
    noiseLayer.gain = state.noiseLayer.gain;
    noiseLayer.frequency = state.noiseLayer.frequency;
  }
}

instantiateNoiseIfNeeded();
const stack = new LayerStack([typographyLayer, noiseLayer]);

function update() {
  if (state.animating) {
    if (state.useAdvanceTime) {
      stack.advanceTime(state.speed);
      state.t += state.speed;
    } else {
      state.t += state.speed;
      stack.setTime(state.t);
    }
  }
}

function render() {
  instantiateNoiseIfNeeded();

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
}

function loop(now = performance.now()) {
  update();
  render();
  fpsChart.record(now);
  fpsChart.draw();
  requestAnimationFrame(loop);
}

loop();
