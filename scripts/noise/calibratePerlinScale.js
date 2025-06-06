import { PerlinNoise2DTime } from "../../src/lib/noise/PerlinNoise2DTime.js";
import { FlowNoise2DTime } from "../../src/lib/noise/FlowNoise2DTime.js";

function findEmpiricalScale({
  NoiseClass,
  xSteps = 1000,
  ySteps = 1000,
  tSteps = 5,
  xStepSize = 0.05,
  yStepSize = 0.05,
  tStepSize = 0.2,
  seeds = [
    0,
    1,
    2,
    3,
    4,
    5,
    42,
    123,
    4567,
    123456,
    999999,
    Date.now(),
    Date.now() + 1,

    Date.now() + 2,
  ],
} = {}) {
  let globalMin = Infinity,
    globalMax = -Infinity;

  for (const seed of seeds) {
    const noise = new NoiseClass({ seed });
    let localMin = Infinity,
      localMax = -Infinity;

    for (let ti = 0; ti < tSteps; ti++) {
      const t = ti * tStepSize;
      noise.setTime(t);
      for (let yi = 0; yi < ySteps; yi++) {
        for (let xi = 0; xi < xSteps; xi++) {
          const x = xi * xStepSize;
          const y = yi * yStepSize;
          const v = noise.getValue(x, y);
          if (v < localMin) localMin = v;
          if (v > localMax) localMax = v;
        }
      }
    }
    if (localMin < globalMin) globalMin = localMin;
    if (localMax > globalMax) globalMax = localMax;
    console.log(
      `${NoiseClass.name} seed ${seed}: min=${localMin}, max=${localMax}`
    );
  }

  const recommendedScale = Math.max(Math.abs(globalMin), Math.abs(globalMax));
  console.log(`\n=== Empirical ${NoiseClass.name} Range ===`);
  console.log(`Global min: ${globalMin}`);
  console.log(`Global max: ${globalMax}`);
  console.log(`Recommended scale factor: ${recommendedScale}\n`);
}

findEmpiricalScale({ NoiseClass: PerlinNoise2DTime });
findEmpiricalScale({ NoiseClass: FlowNoise2DTime });
