/**
 * NullNoise2DTime is a dummy 2D noise implementation that always returns zero.
 *
 * This class implements the Noise2DTime interface but produces a constant, featureless field.
 *
 * Implements the Noise2DTime API:
 * - get time(): Readonly accessor for the current time parameter (always zero).
 * - setTime(t): No operation.
 * - advanceTime(dt): No operation.
 * - getValue(x, y): Always returns 0.
 *
 * @implements {Noise2DTime}
 */
export class NullNoise2DTime {
  /**
   * The current time parameter (always zero for NullNoise2DTime).
   * @type {number}
   * @readonly
   */
  get time() {
    return 0;
  }

  /**
   * Set the time parameter (no-op for NullNoise2DTime).
   * @param {number} t
   */
  setTime(t) {}

  /**
   * Advance the internal time by a delta (no-op for NullNoise2DTime).
   * @param {number} dt
   */
  advanceTime(dt) {}

  /**
   * Returns the noise value at (x, y), always zero for NullNoise2DTime.
   * @param {number} x
   * @param {number} y
   * @returns {number} Always 0.
   */
  getValue(x, y) {
    return 0;
  }
}
