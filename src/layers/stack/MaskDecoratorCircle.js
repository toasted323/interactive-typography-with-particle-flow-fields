/**
 * Decorator that applies a circular, time-dependent mask to a layer.
 * The mask can be activated, updated, and deactivated (with fade-out).
 * If not updated for `autoFadeDuration`, it auto-deactivates.
 *
 * @class
 */
export class MaskDecoratorCircle {
  /**
   * The wrapped layer to which the mask is applied.
   * @type {Layer}
   */
  layer;

  /**
   * The radius of the circular mask.
   * @type {number}
   */
  radius;

  /**
   * Fade-out duration in seconds after deactivation.
   * @type {number}
   */
  fadeOutDuration;

  /**
   * Duration in seconds after last update before auto-fade starts.
   * @type {number}
   */
  autoFadeDuration;

  /** @private @type {?number} */
  #centerX = null;
  /** @private @type {?number} */
  #centerY = null;
  /** @private @type {boolean} */
  #active = false;
  /** @private @type {boolean} */
  #fading = false;
  /** @private @type {?number} */
  #fadeOutStartTime = null;
  /** @private @type {?number} */
  #lastUpdateTime = null;
  /** @private @type {?number} */
  #t = null;

  /**
   * @param {Layer} layer - The layer to mask.
   * @param {object} opts - Mask options.
   * @param {number} opts.centerX - Initial center X coordinate (optional).
   * @param {number} opts.centerY - Initial center Y coordinate (optional).
   * @param {number} opts.radius - Radius of the mask.
   * @param {number} opts.fadeOutDuration - Fade-out duration in seconds.
   * @param {number} opts.autoFadeDuration - Inactivity duration before auto-fade.
   */
  constructor(layer, opts) {
    this.layer = layer;
    this.radius = opts.radius;
    this.fadeOutDuration = opts.fadeOutDuration;
    this.autoFadeDuration = opts.autoFadeDuration;
  }

  /**
   * Activates and positions the mask at the current internal time.
   * @param {number} centerX
   * @param {number} centerY
   */
  activate(centerX, centerY) {
    this.#active = true;
    this.#fading = false;

    this.#centerX = centerX;
    this.#centerY = centerY;

    this.#fadeOutStartTime = null;
    this.#lastUpdateTime = this.#t;

    console.log(`[Mask] Activated at (${centerX}, ${centerY}) t=${this.#t}`);
  }

  /**
   * Updates the mask position and resets the auto-fade timer at the current internal time.
   * @param {number} centerX
   * @param {number} centerY
   */
  update(centerX, centerY) {
    this.#centerX = centerX;
    this.#centerY = centerY;
    this.#lastUpdateTime = this.#t;
    if (!this.#active || this.#fading) {
      this.#active = true;
      this.#fading = false;
      this.#fadeOutStartTime = null;

      console.log(
        `[Mask] Reactivated by update at (${centerX}, ${centerY}) t=${this.#t}`
      );
    } else {
      console.log(`[Mask] Updated at (${centerX}, ${centerY}) t=${this.#t}`);
    }
  }

  /**
   * Starts the fade-out phase at the current internal time.
   */
  deactivate() {
    if (this.#active && !this.#fading) {
      this.#fading = true;
      this.#fadeOutStartTime = this.#t;

      console.log(`[Mask] Deactivated at t=${this.#t}, starting fade out`);
    }
  }

  /**
   * Checks if the mask should auto-fade due to inactivity.
   * Called internally from setTime and advanceTime.
   * @private
   * @returns {void}
   */
  #checkAutoFade() {
    if (
      this.#active &&
      !this.#fading &&
      this.#lastUpdateTime !== null &&
      this.#t - this.#lastUpdateTime > this.autoFadeDuration
    ) {
      this.deactivate(this.#t);
    }
  }

  /**
   * Sets the current time for the mask and underlying layer.
   * @param {number} t - Current time (seconds).
   * @returns {void}
   */
  setTime(t) {
    this.layer.setTime(t);
    this.#t = t;
    this.#checkAutoFade();
  }

  /**
   * Advances the current time for the mask and underlying layer.
   * @param {number} dt - Time delta (seconds).
   * @returns {void}
   */
  advanceTime(dt) {
    this.layer.advanceTime(dt);
    this.#t = (this.#t ?? 0) + dt;
    this.#checkAutoFade();
  }

  /**
   * Gets the masked value at a given position.
   * Returns 0 if outside the circle, inactive, or after fade-out.
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {number} The masked value (0 if masked, else layer value * alpha).
   */
  getValue(x, y) {
    if (
      this.#t === null ||
      this.#centerX === null ||
      this.#centerY === null ||
      !this.#active
    )
      return 0;

    let alpha = 1;

    if (this.#fading) {
      const fadeElapsed = this.#t - this.#fadeOutStartTime;
      if (fadeElapsed > this.fadeOutDuration) {
        this.#centerX = null;
        this.#centerY = null;
        this.#fadeOutStartTime = null;
        this.#lastUpdateTime = null;
        this.#active = false;
        this.#fading = false;
        return 0;
      }
      alpha = smoothstep(1, 0, fadeElapsed / this.fadeOutDuration);
    }

    const dx = x - this.#centerX;
    const dy = y - this.#centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.radius) return 0;

    const rNorm = dist / this.radius;
    const maskAlpha = smoothstep(1, 0, rNorm);

    return this.layer.getValue(x, y) * alpha * maskAlpha;
  }
}

/**
 * Smoothstep interpolation between edge0 and edge1.
 * Returns 0 if x <= edge0, 1 if x >= edge1, and a smooth interpolation otherwise.
 *
 * @param {number} edge0 - Lower edge of the transition.
 * @param {number} edge1 - Upper edge of the transition.
 * @param {number} x - Value to interpolate.
 * @returns {number} Interpolated value between 0 and 1.
 */
function smoothstep(edge0, edge1, x) {
  x = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}
