import { FpsChart } from "../../src/utils/FpsChart.js";

import { TypographyBuilder } from "../../src/typography/TypographyBuilder.js";
import { ImageDataAdapter } from "../../src/layers/adapters/ImageDataAdapter.js";

import { PerlinNoise2DTime } from "../../src/noise/PerlinNoise2DTime.js";
import { NoiseAdapter } from "../../src/layers/adapters/NoiseAdapter.js";

import { LayerStack } from "../../src/layers/stack/LayerStack.js";

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

const noise = new PerlinNoise2DTime({ seed: 0 });
const noiseLayer = new NoiseAdapter(noise, 3, 0.05); // gain, frequency

const stack = new LayerStack([typographyLayer, noiseLayer]);

function update() {
  stack.advanceTime(0.5);
}

function render() {
  const img = ctx.createImageData(width, height);
  let i = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = stack.getValue(x, y);

      const c = Math.floor(255 * value);
      img.data[i++] = c;
      img.data[i++] = c;
      img.data[i++] = c;
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
