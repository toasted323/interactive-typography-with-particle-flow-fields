import { FlowNoise2DTime } from "../../src/noise/FlowNoise2DTime.js";
import { PerlinNoise2DTime } from "../../src/noise/PerlinNoise2DTime.js";

function testRange(
  noise,
  {
    xSteps = 100,
    ySteps = 100,
    tSteps = 100,
    xStepSize = 0.1,
    yStepSize = 0.1,
    tStepSize = 0.1,
    expectedMin = -1.0,
    expectedMax = 1.0,
  } = {}
) {
  let min = Infinity,
    max = -Infinity,
    sum = 0,
    sumSq = 0,
    count = 0,
    outOfRange = 0;
  for (let ti = 0; ti < tSteps; ti++) {
    const t = ti * tStepSize;
    noise.setTime(t);
    for (let yi = 0; yi < ySteps; yi++) {
      for (let xi = 0; xi < xSteps; xi++) {
        const x = xi * xStepSize;
        const y = yi * yStepSize;
        const v = noise.getValue(x, y);
        if (v < min) min = v;
        if (v > max) max = v;
        sum += v;
        sumSq += v * v;
        count++;
        if (v < expectedMin - 1e-6 || v > expectedMax + 1e-6) {
          outOfRange++;
        }
      }
    }
  }
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  const stddev = Math.sqrt(variance);
  const percentOut = (outOfRange / count) * 100;

  return {
    samples: count,
    min: Number(min.toFixed(4)),
    max: Number(max.toFixed(4)),
    mean: Number(mean.toFixed(4)),
    stddev: Number(stddev.toFixed(4)),
    outOfRange,
    percentOut: Number(percentOut.toFixed(4)),
  };
}

const seeds = [0, 1, 42, 123456, Date.now()];

const perlinResults = [];
const flowResults = [];

for (const seed of seeds) {
  const perlinStats = testRange(new PerlinNoise2DTime({ seed: seed }));
  perlinResults.push({ seed, ...perlinStats });

  const flowStats = testRange(new FlowNoise2DTime({ seed: seed }));
  flowResults.push({ seed, ...flowStats });
}

console.log("\nPerlinNoise2DTime Results:");
console.table(perlinResults);

console.log("\nFlowNoise2DTime Results:");
console.table(flowResults);

console.log("\nTesting edge cases for PerlinNoise2DTime:");

// Large positive coordinates
const edgeCaseResults = [];
const seed = 42;
const edgeCaseStats = testRange(new PerlinNoise2DTime({ seed: seed }), {
  xSteps: 10,
  ySteps: 10,
  tSteps: 5,
  xStepSize: 100.111,
  yStepSize: 100.111,
  tStepSize: 10.111,
  expectedMin: -1,
  expectedMax: 1,
});

edgeCaseResults.push({ seed, ...edgeCaseStats });
console.table(edgeCaseResults);
