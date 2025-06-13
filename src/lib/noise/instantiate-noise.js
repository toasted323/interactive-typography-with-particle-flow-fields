import { PerlinNoise2DTime } from "$lib/noise/perlin-noise-2d-time.js";
import { FlowNoise2DTime } from "$lib/noise/flow-nose-2d-time.js";
import { FBMNoise2DTime } from "$lib/noise/fbm-noise-2d-time.js";
import { TurbulenceNoise2DTime } from "$lib/noise/turbulence-noise-2d-time.js";

const noiseClasses = {
  PerlinNoise2DTime,
  FlowNoise2DTime,
  FBMNoise2DTime,
  TurbulenceNoise2DTime,
};

/**
 * Instantiates a new noise object of the given type, with parameters and at time 0.
 * Handles both simple and octave-based (FBM, Turbulence) noise types.
 *
 * @param {string} type - The noise class name to instantiate (e.g. "PerlinNoise2DTime", "FBMNoise2DTime").
 * @param {Object} params - Parameters for the noise instance. For octave-based types, must include baseType and baseParams.
 * @returns {Noise2DTime} The instantiated noise object, with its time set to zero.
 * @throws {Error} If the noise type or base noise type is unknown.
 */
export function instantiateNoise(type, params) {
  let instance;
  if (type === "FBMNoise2DTime" || type === "TurbulenceNoise2DTime") {
    const baseType = params.baseType;
    const baseParams =
      baseType === "PerlinNoise2DTime"
        ? params.perlinBaseParams
        : params.flowBaseParams;

    const BaseNoiseClass = noiseClasses[baseType];
    if (!BaseNoiseClass)
      throw new Error("Unknown base noise type: " + baseType);

    const baseNoise = new BaseNoiseClass(baseParams);

    const octaveParams = {
      octaves: params.octaves,
      persistence: params.persistence,
      lacunarity: params.lacunarity,
    };

    const OctaveNoiseClass = noiseClasses[type];
    instance = new OctaveNoiseClass(baseNoise, octaveParams);
  } else {
    const NoiseClass = noiseClasses[type];
    if (!NoiseClass) throw new Error("Unknown noise type: " + type);
    instance = new NoiseClass(params);
  }

  instance.setTime(0);

  return instance;
}
