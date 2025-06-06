/**
 * Abstract base class for 2D noise with time evolution.
 *
 * Subclasses or duck-typed implementations must implement:
 * - getValue(x, y, frequency)
 * - get time()
 * - setTime(t)
 * - advanceTime(dt)
 *
 * Attempting to instantiate Noise2DTime directly will throw an error.
 *
 * Note:
 *   - Different implementations are expected to produce different results for the same (x, y, t, dt, frequency) inputs,
 *     due to differences in their mathematical models and internal state.
 *   - The interpretation of the time and frequency parameters may vary between subclasses.
 *     E.g. some noise types may apply frequency scaling to the time dimension, while others may not.
 *   - Some implementations may support efficient incremental time advancement via advanceTime(dt),
 *     which can be preferable for real-time animation (e.g., using angle addition for rotating gradients).
 *   - Always refer to the concrete implementations documentation for details on parameter effects and supported methods.
 *
 * @abstract
 * @interface
 */
export class Noise2DTime {
  constructor() {
    if (new.target === Noise2DTime) {
      throw new Error(
        "Noise2DTime is an abstract class and cannot be instantiated directly."
      );
    }
  }

  /**
   * The current time parameter.
   * @type {number}
   * @readonly
   */
  get time() {
    throw new Error(
      "Abstract method: get time() must be implemented by subclass."
    );
  }

  /**
   * Set the time parameter for smooth evolution (absolute time).
   * @param {number} t
   * @abstract
   */
  setTime(t) {
    throw new Error(
      "Abstract method: setTime(t) must be implemented by subclass."
    );
  }

  /**
   * Advance the internal time by a delta (incremental time).
   * Subclasses may provide implementations for efficient incremental updates (e.g., using angle addition).
   * Default implementations simply call setTime(currentTime + dt) if currentTime is tracked,
   * or throws if not supported.
   * @param {number} dt
   * @abstract
   */
  advanceTime(dt) {
    throw new Error(
      "Abstract Method: advanceTime(dt) must be implemented by subclass."
    );
  }

  /**
   * Returns the noise value at (x, y) at current time.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   * @abstract
   */
  getValue(x, y) {
    throw new Error(
      "Abstract method: getValue(x, y) must be implemented by subclass."
    );
  }
}
