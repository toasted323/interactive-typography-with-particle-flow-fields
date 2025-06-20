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
   * Output multiplier for layer values.
   * @type {number}
   * @public
   */
  gain = 1.0;

  /**
   * Frequency multiplier for noise coordinates.
   * @type {number}
   * @public
   */
  frequency;

  /**
   * Time scale multiplier for noise time evolution.
   * @type {number}
   * @public
   */
  noiseTimeScale;

  /**
   * Cached last simulation time set on this adapter.
   * Used to synchronize newly attached noise instances.
   * @type {number}
   * @private
   */
  #lastTime = 0;

  /**
   * The wrapped Noise2DTime instance (private).
   * @type {Noise2DTime}
   * @private
   */
  #noise;

  /**
   * Create a new NoiseAdapter.
   * @param {Noise2DTime} noise - A concrete Noise2DTime instance.
   * @param {boolean} [enabled=true] - Whether the layer is enabled.
   * @param {number} [gain=1] - Output multiplier.
   * @param {number} [frequency=1] - Noise frequency.
   * @param {number} [noiseTimeScale=1] - Noise temporal evolution scale.
   */
  constructor(
    noise,
    enabled = true,
    gain = 1,
    frequency = 1,
    noiseTimeScale = 1
  ) {
    this.#noise = noise;
    this.enabled = enabled;
    this.gain = gain;
    this.frequency = frequency;
    this.noiseTimeScale = noiseTimeScale;
  }

  /**
   * Read-only access to the wrapped Noise2DTime instance.
   * @returns {Noise2DTime}
   */
  get noise() {
    return this.#noise;
  }

  /**
   * Attach a new Noise2DTime instance to this adapter and synchronize its internal time.
   * The new noise instance will immediately receive the last simulation time set on the adapter,
   * mapped through the current frequency and noiseTimeScale.
   *
   * @param {Noise2DTime} newNoise - The new Noise2DTime instance to attach.
   */
  attachNoise(newNoise) {
    this.#noise = newNoise;
    this.#noise.setTime(this.#lastTime * this.noiseTimeScale * this.frequency);
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
      (this.#noise.getValue(x * this.frequency, y * this.frequency) + 1)
    );
  }

  /**
   * The current time state of the layer.
   * @type {number}
   * @readonly
   */
  get time() {
    return this.#noise.time;
  }

  /**
   * Set the current time for the underlying noise, applying noiseTimeScale and frequency.
   * Throws if the layer is disabled.
   * @param {number} t - Time value.
   * @throws {Error} if the layer is disabled.
   */
  setTime(t) {
    if (!this.enabled) {
      throw new Error("setTime() called on disabled layer");
    }
    this.#lastTime = t;
    this.#noise.setTime(t * this.noiseTimeScale * this.frequency);
  }

  /**
   * Advance the current time for the underlying noise, applying noiseTimeScale and frequency.
   * Throws if the layer is disabled.
   * @param {number} dt - Time delta.
   * @throws {Error} if the layer is disabled.
   */
  advanceTime(dt) {
    if (!this.enabled) {
      throw new Error("advanceTime() called on disabled layer");
    }
    this.#lastTime += dt;
    this.#noise.advanceTime(dt * this.noiseTimeScale * this.frequency);
  }
}
