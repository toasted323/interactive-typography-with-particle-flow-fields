/**
 * Generates 2D turbulence noise with time evolution by summing the absolute value of multiple octaves of a base Noise2DTime source.
 *
 * Each octave is sampled at increasing frequency and decreasing amplitude. The absolute value of each octave is summed and normalized,
 * producing turbulent, ridged procedural noise patterns that evolve smoothly over time.
 *
 * Implements the Noise2DTime API: get time(), setTime(t), advanceTime(dt), getValue(x, y).
 * The base noise must implement the Noise2DTime API.
 *
 * @implements {Noise2DTime}
 */
export class TurbulenceNoise2DTime {
  #lastTime = 0;

  /**
   * @param {Object} baseNoise - Base noise instance implementing Noise2DTime API.
   * @param {Object} [opts] - Configuration options.
   * @param {number} [opts.octaves=4] - Number of octaves (layers) to sum.
   * @param {number} [opts.persistence=0.5] - Amplitude multiplier for each successive octave.
   * @param {number} [opts.lacunarity=2.0] - Frequency multiplier for each successive octave.
   */
  constructor(
    baseNoise,
    { octaves = 4, persistence = 0.5, lacunarity = 2.0 } = {}
  ) {
    this.baseNoise = baseNoise;
    this.octaves = octaves;
    this.persistence = persistence;
    this.lacunarity = lacunarity;
  }

  /**
   * The current time parameter.
   * @type {number}
   * @readonly
   */
  get time() {
    return this.#lastTime;
  }

  /**
   * Sets the current time for the noise field (propagates to base noise).
   * @param {number} t - The time value to set.
   */
  setTime(t) {
    this.#lastTime = t;
    this.baseNoise.setTime(t);
  }

  /**
   * Advances the internal time by a delta (propagates to base noise).
   * @param {number} dt - The time increment.
   */
  advanceTime(dt) {
    this.#lastTime += dt;
    this.baseNoise.advanceTime(dt);
  }

  /**
   * Returns the turbulence noise value at (x, y) for the current time, combining all octaves.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} The normalized turbulence noise value, typically in [0, 1].
   */
  getValue(x, y) {
    let total = 0;
    let amplitude = 1;
    let maxAmplitude = 0;
    let frequency = 1;

    for (let i = 0; i < this.octaves; i++) {
      this.baseNoise.setTime(this.time * frequency);
      total +=
        Math.abs(this.baseNoise.getValue(x * frequency, y * frequency)) *
        amplitude;
      maxAmplitude += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }
    this.baseNoise.setTime(this.time);

    return total / maxAmplitude;
  }
}
