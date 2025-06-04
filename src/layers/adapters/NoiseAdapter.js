/**
 * Adapter for Noise2DTime instances, conforming to the Layer API.
 * Samples noise values for (x, y) and returns them normalized to the range [0,1], scaled by gain.
 *
 * Participation is controlled by the `enabled` flag. If the layer is disabled,
 * the LayerStack must not call `getValue`, `setTime`, or `advanceTime` on it.
 * Calling `getValue` on a disabled layer will throw an exception.
 *
 * @implements {Layer}
 */
export class NoiseAdapter {
  /**
   * Whether this layer is active in the stack.
   * If false, the LayerStack must not query this layer for values or state.
   * @type {boolean}
   * @public
   */
  enabled = true;

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
   * @param {boolean} [enabled=true] - Whether the layer is enabled.
   * @param {number} [gain=1] - Output multiplier.
   * @param {number} [frequency=1] - Noise frequency.
   * @param {number} [noiseSpeed=1] - Noise temporal evolution speed.
   */
  constructor(noise, enabled = true, gain = 1, frequency = 1, noiseSpeed = 1) {
    this.noise = noise;
    this.enabled = enabled;
    this.gain = gain;
    this.frequency = frequency;
    this.noiseSpeed = noiseSpeed;
  }

  /**
   * Get the normalized noise value at (x, y) for the given frequency, scaled by gain.
   * Throws if the layer is disabled.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} Normalized value [0,1], scaled by gain.
   * @throws {Error} if the layer is disabled.
   */
  getValue(x, y) {
    if (!this.enabled) {
      throw new Error("getValue() called on disabled layer");
    }
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
   * Throws if the layer is disabled.
   * @param {number} t - Time value.
   * @throws {Error} if the layer is disabled.
   */
  setTime(t) {
    if (!this.enabled) {
      throw new Error("setTime() called on disabled layer");
    }
    this.noise.setTime(t * this.noiseSpeed * this.frequency);
  }

  /**
   * Advance the current time for the underlying noise, applying noiseSpeed and frequency.
   * Throws if the layer is disabled.
   * @param {number} dt - Time delta.
   * @throws {Error} if the layer is disabled.
   */
  advanceTime(dt) {
    if (!this.enabled) {
      throw new Error("advanceTime() called on disabled layer");
    }
    this.noise.advanceTime(dt * this.noiseSpeed * this.frequency);
  }
}
