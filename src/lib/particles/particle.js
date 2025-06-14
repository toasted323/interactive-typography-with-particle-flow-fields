/**
 * Represents a single particle.
 *
 * @property {number} age - Current age of the particle in time units.
 * @property {number} lifeSpan - Lifespan of the particle in time units.
 * @property {boolean} visible - Whether the particle is currently visible.
 * @property {number} maxInvisibleSteps - Maximum allowed consecutive invisible steps.
 * @property {number} visibleTrailCapacity - Max positions in visible trail buffer.
 * @property {number} visibleX - Current visible X coordinate.
 * @property {number} visibleY - Current visible Y coordinate.
 * @property {number} lastVisibleX - Previous visible X coordinate.
 * @property {number} lastVisibleY - Previous visible Y coordinate.
 * @property {number} realX - Current real (possibly invisible) X coordinate.
 * @property {number} realY - Current real (possibly invisible) Y coordinate.
 */
export class Particle {
  #age;
  #lifeSpan;
  #visible;
  #visibleX;
  #visibleY;
  #lastVisibleX;
  #lastVisibleY;
  #realX;
  #realY;
  #invisibleSteps;
  #maxInvisibleSteps;
  #visibleTrailCapacity;
  #visibleTrailHead;
  #visibleTrailLength;
  #visibleTrailX;
  #visibleTrailY;

  /**
   * @param {number} [lifeSpan=10] - Lifespan in time units.
   * @param {number} [maxInvisibleSteps=10] - Maximum number of invisible position updates the particle can survive.
   * @param {number} [visibleTrailCapacity=10] - Maximum number of positions to keep in trail buffer.
   */
  constructor(
      lifeSpan = 10,
      maxInvisibleSteps = 10,
      visibleTrailCapacity = 10
  ) {
    this.setLifeSpan(lifeSpan);
    this.setMaxInvisibleSteps(maxInvisibleSteps);
    this.setVisibleTrailCapacity(visibleTrailCapacity);

    this.#reset();
  }

  /**
   * Private method to reset all mutable state.
   */
  #reset() {
    this.#age = 0;
    this.#visible = false;
    this.#visibleX = null;
    this.#visibleY = null;
    this.#lastVisibleX = null;
    this.#lastVisibleY = null;
    this.#realX = null;
    this.#realY = null;
    this.#invisibleSteps = 0;

    if (this.#visibleTrailCapacity > 0) {
      this.#visibleTrailHead = 0;
      this.#visibleTrailLength = 0;
    }
  }

  get age() {
    return this.#age;
  }

  get lifeSpan() {
    return this.#lifeSpan;
  }

  get visible() {
    return this.#visible;
  }

  get visibleX() {
    return this.#visibleX;
  }

  get visibleY() {
    return this.#visibleY;
  }

  get lastVisibleX() {
    return this.#lastVisibleX;
  }

  get lastVisibleY() {
    return this.#lastVisibleY;
  }

  get realX() {
    return this.#realX;
  }

  get realY() {
    return this.#realY;
  }

  get invisibleSteps() {
    return this.#invisibleSteps;
  }

  get maxInvisibleSteps() {
    return this.#maxInvisibleSteps;
  }

  get visibleTrailCapacity() {
    return this.#visibleTrailCapacity;
  }

  get visibleTrailLength() {
    return this.#visibleTrailLength;
  }

  /**
   * Sets the life span of the particle (in time units).
   * Resets the particle if its age exceeds the new life span.
   * @param {number} value
   */
  setLifeSpan(value) {
    if (typeof value !== "number" || value < 0) {
      throw new Error("lifeSpan must be a non-negative number");
    }
    this.#lifeSpan = value;
    if (this.#age > this.#lifeSpan) {
      this.#reset();
    }
  }

  /**
   * Sets the maximum allowed consecutive invisible steps.
   * Resets the particle if its current invisible steps exceeds the new maximum.
   * @param {number} value
   */
  setMaxInvisibleSteps(value) {
    if (typeof value !== "number" || value < 0) {
      throw new Error("maxInvisibleSteps must be a non-negative number");
    }
    this.#maxInvisibleSteps = value;
    if (this.#invisibleSteps > this.#maxInvisibleSteps) {
      this.#reset();
    }
  }

  /**
   * Sets the visible trail buffer capacity, resizing internal arrays and preserving as much trail as possible.
   * @param {number} newCapacity
   */
  setVisibleTrailCapacity(newCapacity) {
    if (typeof newCapacity !== "number" || newCapacity < 0) {
      throw new Error("visibleTrailCapacity must be a non-negative number");
    }
    if (newCapacity === this.#visibleTrailCapacity) return;

    const oldTrail = this.getVisibleTrail();

    this.#visibleTrailCapacity = newCapacity;
    this.#visibleTrailX = newCapacity > 0 ? new Array(newCapacity) : [];
    this.#visibleTrailY = newCapacity > 0 ? new Array(newCapacity) : [];
    this.#visibleTrailHead = 0;

    // Copy as much of the old trail as fits, from the end (most recent)
    const toCopy = Math.min(oldTrail.length, newCapacity);
    this.#visibleTrailLength = toCopy;
    for (let i = 0; i < toCopy; i++) {
      const {x, y} = oldTrail[oldTrail.length - toCopy + i];
      this.#visibleTrailX[i] = x;
      this.#visibleTrailY[i] = y;
    }
  }

  /**
   * Returns whether the particle is alive based on its current state.
   * The particle is considered alive if it has a position.
   * @returns {boolean}
   */
  get isAlive() {
    return this.realX !== null && this.realY !== null;
  }

  /**
   * Returns the relative age of the particle (age divided by lifeSpan, in [0, 1+]).
   * @type {number}
   */
  get relativeAge() {
    return this.lifeSpan > 0 ? this.#age / this.lifeSpan : 0;
  }

  /**
   * Resets the particle to initial state, clearing its state and trail buffer.
   */
  kill() {
    this.#reset();
  }

  /**
   * Appends a point to the visible trail buffer (private).
   * @param {number} x
   * @param {number} y
   * @private
   */
  #appendToVisibleTrail(x, y) {
    if (this.visibleTrailCapacity === 0) return;

    const idx =
        (this.#visibleTrailHead + this.#visibleTrailLength) %
        this.visibleTrailCapacity;
    this.#visibleTrailX[idx] = x;
    this.#visibleTrailY[idx] = y;

    if (this.#visibleTrailLength < this.visibleTrailCapacity) {
      this.#visibleTrailLength++;
    } else {
      this.#visibleTrailHead =
          (this.#visibleTrailHead + 1) % this.visibleTrailCapacity;
    }
  }

  /**
   * Returns the particle's visible trail as an array of {x, y} objects, in FIFO order.
   * @returns {{x: number, y: number}[]}
   */
  getVisibleTrail() {
    if (this.visibleTrailCapacity === 0) return [];
    const result = [];
    for (let i = 0; i < this.#visibleTrailLength; i++) {
      const idx = (this.#visibleTrailHead + i) % this.visibleTrailCapacity;
      result.push({x: this.#visibleTrailX[idx], y: this.#visibleTrailY[idx]});
    }
    return result;
  }

  /**
   * Updates the particle's location, visibility, and age.
   * @param {boolean} visible - Whether the particle is currently visible.
   * @param {number} x - The new x position.
   * @param {number} y - The new y position.
   * @param {number} dt - Time interval (must be > 0).
   */
  updateLocation(visible, x, y, dt) {
    if (!(dt >= 0)) {
      throw new Error("dt must be greater than or equal to zero");
    }

    this.#lastVisibleX = this.#visibleX;
    this.#lastVisibleY = this.#visibleY;

    this.#realX = x;
    this.#realY = y;

    this.#age += dt;
    if (this.#age > this.#lifeSpan) {
      this.#reset();
      return;
    }

    if (!visible) {
      this.#visible = false;
      this.#invisibleSteps++;
      if (this.#invisibleSteps > this.#maxInvisibleSteps) {
        this.#reset();
      }
      return;
    }

    if (!this.#visible) {
      this.#visible = true;
      this.#invisibleSteps = 0;
    }
    this.#visibleX = x;
    this.#visibleY = y;

    if (this.#visibleTrailCapacity > 0) {
      this.#appendToVisibleTrail(x, y);
    }
  }
}
