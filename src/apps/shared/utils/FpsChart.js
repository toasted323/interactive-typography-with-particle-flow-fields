export class FpsChart {
  constructor(canvas, { width = 100, height = 10, maxFps = 60 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.maxFps = maxFps;
    this.history = new Array(width).fill(0);
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.currentFps = 0;
  }

  record(now = performance.now()) {
    this.frameCount++;
    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= 200) {
      this.currentFps = this.frameCount / (elapsed / 1000);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      this.history.push(this.currentFps);
      if (this.history.length > this.width) this.history.shift();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "#4af";
    for (let i = 0; i < this.history.length; i++) {
      const h = Math.round((this.history[i] / this.maxFps) * this.height);
      this.ctx.fillRect(i, this.height - h, 1, h);
    }
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "8px monospace";
    this.ctx.fillText(Math.round(this.currentFps) + " fps", 2, 8);
  }
}
