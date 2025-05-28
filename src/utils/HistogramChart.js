export class HistogramChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.bins = 20;
    this.histogram = new Array(this.bins).fill(0);
  }

  update(data) {
    this.histogram.fill(0);

    for (const v of data) {
      const bin = Math.floor((v + 1) * (this.bins / 2));
      const clampedBin = Math.max(0, Math.min(this.bins - 1, bin));
      this.histogram[clampedBin]++;
    }
  }

  draw() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const maxCount = Math.max(...this.histogram);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / this.bins;
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

    for (let i = 0; i < this.bins; i++) {
      const height = (this.histogram[i] / maxCount) * canvas.height;
      ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 1, height);
    }
  }
}
