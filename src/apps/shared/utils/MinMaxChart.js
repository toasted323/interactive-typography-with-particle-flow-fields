export class MinMaxChart {
  constructor(canvas, { width = 256, height = 100 } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = width;
    this.height = height;
    this.history = new Array(width).fill({ min: 0, max: 0 });
  }

  record(min, max) {
    this.history.push({ min, max });
    if (this.history.length > this.width) this.history.shift();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // lines
    ctx.strokeStyle = "#4af";
    ctx.beginPath();
    for (let i = 0; i < this.history.length; i++) {
      const y = this.height - ((this.history[i].max + 1) * this.height) / 2;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    ctx.strokeStyle = "#fa4";
    ctx.beginPath();
    for (let i = 0; i < this.history.length; i++) {
      const y = this.height - ((this.history[i].min + 1) * this.height) / 2;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // values
    const latest = this.history[this.history.length - 1];
    if (latest) {
      let absMin = Infinity,
        absMax = -Infinity;
      for (const entry of this.history) {
        if (entry.min < absMin) absMin = entry.min;
        if (entry.max > absMax) absMax = entry.max;
      }

      ctx.font = "12px monospace";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const yCenter = this.height / 2;
      ctx.fillText(
        `min: ${latest.min.toFixed(4)} (${absMin.toFixed(4)})`,
        4,
        yCenter - 8
      );
      ctx.fillText(
        `max: ${latest.max.toFixed(4)} (${absMax.toFixed(4)})`,
        4,
        yCenter + 8
      );
    }
  }
}
