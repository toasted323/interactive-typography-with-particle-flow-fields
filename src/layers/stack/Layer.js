/**
 * Abstract base class for all layers in a compositing stack.
 *
 * Subclasses or duck-typed implementations must implement:
 *   - getValue(x, y)
 *   - get time() (might return undefined)
 *   - setTime(t) (can be a no-op)
 *   - advanceTime(dt) (can be a no-op))
 *
 * Attempting to instantiate Layer directly will throw an error.
 *
 * @abstract
 * @interface
 */
export class Layer {
  constructor() {
    if (new.target === Layer) {
      throw new Error(
        "Layer is an abstract class and cannot be instantiated directly."
      );
    }
  }

  /**
   * Returns the value at (x, y) for the current state.
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

  /**
   * The current time state of the layer.
   * @type {number}
   * @readonly
   */
  get time() {
    return undefined;
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
   * @param {number} dt
   * @abstract
   */
  advanceTime(dt) {
    throw new Error(
      "Abstract method: advanceTime(dt) must be implemented by subclass."
    );
  }
}
