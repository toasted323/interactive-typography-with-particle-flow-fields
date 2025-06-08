/**
 * Adapter for image data, conforming to the Layer API.
 * Samples pixel values from an image data array and returns them normalized to the range [0,1].
 *
 * Participation is controlled by the `enabled` flag. If the layer is disabled,
 * the LayerStack must not call `getValue`, `setTime`, or `advanceTime` on it.
 * Calling `getValue` on a disabled layer will throw an exception.
 *
 * @implements {Layer}
 */
export class ImageDataAdapter {
  /**
   * Whether this layer is active in the stack.
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
   * The underlying ImageData object.
   * @type {ImageData}
   * @public
   */
  imageData;

  /**
   * The width of the image.
   * @type {number}
   * @public
   */
  width;

  /**
   * The height of the image.
   * @type {number}
   * @public
   */
  height;

  /**
   * The channel to sample (0=red, 1=green, 2=blue, 3=alpha).
   * @type {number}
   * @public
   */
  channel;

  /**
   * Create a new ImageDataAdapter.
   * @param {ImageData} imageData - The image data.
   * @param {number} width - image width
   * @param {number} height - image height
   * @param {boolean} [enabled=true] - Whether the layer is enabled.
   * @param {number} [gain=1] - Output multiplier for layer values.
   * @param {number} [channel=3] - The channel to sample: 0=red, 1=green, 2=blue, 3=alpha.
   */
  constructor(imageData, width, height, enabled = true, gain = 1, channel = 3) {
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    this.enabled = enabled;
    this.gain = gain;
    this.channel = channel;
  }

  /**
   * Get the normalized value at (x, y) from the specified channel.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} Normalized value [0,1].
   */
  getValue(x, y) {
    if (!this.enabled) {
      throw new Error("getValue() called on disabled layer");
    }
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    if (xi >= 0 && xi < this.width && yi >= 0 && yi < this.height) {
      const idx = (yi * this.width + xi) * 4;
      return (this.imageData.data[idx + this.channel] / 255) * this.gain;
    }
    return 0;
  }

  get time() {
    // No time-based behavior, but required by Layer API.
    return undefined;
  }

  setTime(t) {
    if (!this.enabled) {
      throw new Error("setTime() called on disabled layer");
    }
    // No-op
  }

  advanceTime(dt) {
    if (!this.enabled) {
      throw new Error("advanceTime() called on disabled layer");
    }
    // No-op
  }
}
