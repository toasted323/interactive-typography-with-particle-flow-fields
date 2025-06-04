/**
 * Adapter for Noise2DTime instances, conforming to the Layer API.
 * Samples noise values for (x,y) and returns them normalized to the range [0,1], scaled by gain.
 *
 * @implements {Layer}
 */
export class NoiseAdapter {
  /**
   * The wrapped Noise2DTime instance.
   * @type {Noise2DTime}
   * @public
   */
  noise;

  /**
   * Output multiplier for noise values.
   * @type {number}
   * @public
   */
  gain;

  /**
   * Frequency multiplier for noise coordinates.
   * @type {number}
   * @public
   */
  frequency;

  /**
   * Speed multiplier for noise time evolution.
   * @type {number}
   * @public
   */
  noiseSpeed;

  /**
   * Create a new NoiseAdapter.
   * @param {Noise2DTime} noise - A concrete Noise2DTime instance.
   * @param {number} [gain=1] - Output multiplier.
   * @param {number} [frequency=1] - Noise frequency.
   * @param {number} [noiseSpeed=1] - Noise temporal evolution speed.
   */
  constructor(noise, gain = 1, frequency = 1, noiseSpeed = 1) {
    this.noise = noise;
    this.gain = gain;
    this.frequency = frequency;
    this.noiseSpeed = noiseSpeed;
  }

  /**
   * Get the normalized noise value at (x, y) for the given frequency, scaled by gain.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} Normalized value [0,1], scaled by gain.
   */
  getValue(x, y) {
    // Map output from [-1,1] to [0,1] and scale by gain
    return (
      this.gain *
      0.5 *
      (this.noise.getValue(x * this.frequency, y * this.frequency) + 1)
    );
  }

  /**
   * The current time state of the layer.
   * @type {number}
   * @readonly
   */
  get time() {
    return this.noise.time;
  }

  /**
   * Set the current time for the underlying noise, applying noiseSpeed and frequency.
   * @param {number} t - Time value.
   */
  setTime(t) {
    this.noise.setTime(t * this.noiseSpeed * this.frequency);
  }

  /**
   * Advance the current time for the underlying noise, applying noiseSpeed and frequency.
   * @param {number} dt - Time delta.
   */
  advanceTime(dt) {
    this.noise.advanceTime(dt * this.noiseSpeed * this.frequency);
  }
}
