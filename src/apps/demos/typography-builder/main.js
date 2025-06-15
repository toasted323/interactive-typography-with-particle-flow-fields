import { buildTypographyCanvas } from "$lib/typography/build-typography-canvas.js";

import {typographyStore} from "$apps/shared/stores/typography.js";

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
  const renderedCanvas = buildTypographyCanvas(
    params,
    canvas.width,
    canvas.height
  );
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(renderedCanvas, 0, 0);
}

typographyStore.subscribe((value) => {
  params = value;
  render();
});
