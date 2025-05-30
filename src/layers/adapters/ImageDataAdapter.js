/**
 * Adapter for image data, conforming to the Layer API.
 * Samples pixel values from an image data array and returns them normalized to the range [0,1].
 *
 * @implements {Layer}
 */
export class ImageDataAdapter {
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
   * @param {number} [channel=3] - The channel to sample: 0=red, 1=green, 2=blue, 3=alpha.
   */
  constructor(imageData, width, height, channel = 3) {
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    this.channel = channel;
  }

  /**
   * Get the normalized value at (x, y) from the specified channel.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} Normalized value [0,1].
   */
  getValue(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    if (xi >= 0 && xi < this.width && yi >= 0 && yi < this.height) {
      const idx = (yi * this.width + xi) * 4;
      return this.imageData.data[idx + this.channel] / 255;
    }
    return 0;
  }

  get time() {
    // No time-based behavior, but required by Layer API.
    return undefined;
  }

  setTime(t) {
    // No time-based behavior, but required by Layer API.
  }

  advanceTime(dt) {
    // No time-based behavior, but required by Layer API.
  }
}
