/**
 * Abstract base class for all layers in a compositing stack.
 *
 * Subclasses or duck-typed implementations must implement:
 *   - enabled (boolean property)
 *   - getValue(x, y)
 *   - get time() (might return undefined)
 *   - setTime(t) (can be a no-op)
 *   - advanceTime(dt) (can be a no-op)
 *
 * Attempting to instantiate Layer directly will throw an error.
 *
 * Layer participation is controlled by the `enabled` flag.
 * If a layer is disabled, the LayerStack must not call `getValue`,
 * `setTime`, or `advanceTime`.
 * Calling any of these methods on a disabled layer will throw an exception.
 *
 * @throws {Error} If any API method is called while the layer is disabled.
 *
 * @abstract
 * @interface
 */
export class Layer {
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

  constructor() {
    if (new.target === Layer) {
      throw new Error(
        "Layer is an abstract class and cannot be instantiated directly."
      );
    }
  }

  /**
   * Returns the value at (x, y) for the current state, scaled by gain.
   * Subclasses must multiply their output by `gain`.
   * Throws if the layer is disabled.
   * @param {number} x
   * @param {number} y
   * @returns {number} The layer's value at (x, y), multiplied by `gain`.
   * @throws {Error} if the layer is disabled.
   * @abstract
   */
  getValue(x, y) {
    if (!this.enabled) {
      throw new Error("getValue() called on disabled layer");
    }
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
   * @throws {Error} if the layer is disabled.
   * @abstract
   */
  setTime(t) {
    if (!this.enabled) {
      throw new Error("getValue() called on disabled layer");
    }
    throw new Error(
      "Abstract method: setTime(t) must be implemented by subclass."
    );
  }

  /**
   * Advance the internal time by a delta (incremental time).
   * @param {number} dt
   * @throws {Error} if the layer is disabled.
   * @abstract
   */
  advanceTime(dt) {
    if (!this.enabled) {
      throw new Error("getValue() called on disabled layer");
    }
    throw new Error(
      "Abstract method: advanceTime(dt) must be implemented by subclass."
    );
  }
}
