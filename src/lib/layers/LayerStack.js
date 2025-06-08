import { multiplyBlending } from "./blending.js";

/**
 * A stack of layers that can be composited using a custom blending function.
 * Each layer must conform to the Layer API, which defines the required methods.
 *
 * The blending function determines how layer values are combined. The default blending
 * function multiplies the values of all layers.
 */
export class LayerStack {
  /**
   * Create a new LayerStack.
   * @param {Array<Layer>} layers - Array of layers to include in the stack. Each must conform to the Layer API.
   * @param {Function} [blendingFunc] - Custom blending function (layers, x, y) => value.
   *   If not provided, uses the default multiplicative blending.
   */
  constructor(layers = [], blendingFunc) {
    this.layers = layers;
    this.blendingFunc = blendingFunc || multiplyBlending;
    this.time = 0;
  }

  /**
   * Get the blended value at (x, y).
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} Blended value.
   */
  getValue(x, y) {
    return this.blendingFunc(this.layers, x, y);
  }

  /**
   * Set the current time for all time-aware layers.
   * @param {number} t - Time value.
   */
  setTime(t) {
    this.time = t;
    for (const layer of this.layers) {
      if (layer.enabled) {
        layer.setTime(t);
      }
    }
  }

  /**
   * Advance the current time for all time-aware layers.
   * @param {number} dt - Time delta.
   */
  advanceTime(dt) {
    this.time += dt;
    for (const layer of this.layers) {
      if (layer.enabled) {
        layer.advanceTime(dt);
      }
    }
  }
}
