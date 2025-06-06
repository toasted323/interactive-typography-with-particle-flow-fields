/**
 * 2D flow (animated) noise with smoothly evolving time dimension.
 *
 * This implementation is based on the "rotating gradients" technique for animated Perlin-style noise,
 * as introduced by Perlin & Neyret (2001) for generating "flow noise".
 * At each grid point, the gradient (basis) vector is smoothly rotated over time at a unique rate,
 * producing a scalar noise field that appears to flow or evolve continuously.
 *
 * The underlying static noise is improved Perlin noise (Ken Perlin, 2002), using a permutation table,
 * quintic smoothstep interpolation, and grid-gradient hashing. The evolution in time is achieved by rotating
 * the gradients, following the flow noise method.
 *
 * Implements the Noise2D API: get time(), setTime(t), advanceTime(dt), getValue(x, y).
 * - get time(): Readonly accessor for the current time parameter.
 * - setTime(t): Sets the current time for the animated flow field (rotates the gradients to time t).
 * - advanceTime(dt): Efficiently advances the flow field by a time increment dt, incrementally rotating gradients.
 * - getValue(x, y): Returns the scalar noise value at (x, y, t), where t is the most recently set or advanced time.
 *
 * Output is normalized to [-1, 1] (the actual theoretical range is about [-0.707, 0.707]).
 *
 * References:
 * - Ken Perlin & Fabrice Neyret, "Flow Noise", 2001.
 * - Ken Perlin, "Improving Noise", 2002.
 *
 * @implements {Noise2DTime}
 */
export class FlowNoise2DTime {
  /**
   * Linearly interpolates between v0 and v1 by factor f.
   * @param {number} v0 - Start value.
   * @param {number} v1 - End value.
   * @param {number} f - Interpolation factor in [0, 1].
   * @returns {number} The interpolated value.
   */
  static #lerp(v0, v1, f) {
    return (1 - f) * v0 + f * v1;
  }

  /**
   * Smoothly interpolates between 0 and 1 with a quintic curve.
   * Clamps input to [0,1].
   * @param {number} r - The interpolation parameter.
   * @returns {number} The smoothed value.
   */
  static #smoothStep(r) {
    if (r < 0) return 0;
    if (r > 1) return 1;
    return r * r * r * (10 + r * (-15 + r * 6));
  }

  /**
   * Generates a deterministic pseudo-random unsigned 32-bit integer from a seed.
   * @param {number} seed - The input seed.
   * @returns {number} The hashed unsigned integer.
   */
  static #randHash(seed) {
    let i = (seed ^ 12345391) * 2654435769;
    i ^= (i << 6) ^ (i >>> 26);
    i = (i * 2654435769) >>> 0;
    i += (i << 5) ^ (i >>> 12);
    return i >>> 0; // Ensure unsigned 32-bit
  }

  /**
   * Generates a random float in [min, max] using a hashed seed.
   */
  static #randHashFInterval(seed, min, max) {
    return min + (max - min) * (FlowNoise2DTime.#randHash(seed) / 0xffffffff);
  }

  // Private instance fields
  #N;
  #basis;
  #perm;
  #originalBasis;
  #spinRate;
  #rotCos;
  #rotSin;
  #lastTime;
  #dt;

  /**
   * Creates a 2D flow noise generator.
   *
   * @param {object} [opts] - Options for the noise generator.
   * @param {number} [opts.seed=171717] - Seed for permutation/randomness.
   * @param {number} [opts.spinVariation=0.2] - Variation in spin rates.
   * @param {number} [opts.N=128] - Number of basis/permutation vectors (table size). Higher N increases quality but uses more memory and is slower.
   */
  constructor(opts = {}) {
    let { seed = 171717, spinVariation = 0.2, N = 128 } = opts;
    this.#N = N;
    this.#basis = new Array(this.#N);
    this.#perm = new Array(this.#N);
    this.#originalBasis = new Array(this.#N);
    this.#spinRate = new Array(this.#N);
    this.#rotCos = new Array(this.#N);
    this.#rotSin = new Array(this.#N);
    for (let i = 0; i < this.#N; ++i) {
      this.#rotCos[i] = 1;
      this.#rotSin[i] = 0;
    }
    this.#lastTime = 0;
    this.#dt = 0;

    // Initialize basis and permutation
    for (let i = 0; i < this.#N; ++i) {
      const theta = (i / this.#N) * 2 * Math.PI;
      const p = { x: Math.cos(theta), y: Math.sin(theta) };
      this.#basis[i] = { x: p.x, y: p.y };
      this.#perm[i] = i;
    }
    this.#reinitialize(seed);

    // Original basis and spin rates
    seed += this.#N;
    for (let i = 0; i < this.#N; ++i) {
      this.#originalBasis[i] = { x: this.#basis[i].x, y: this.#basis[i].y };
      const rnd = FlowNoise2DTime.#randHashFInterval(
        seed++,
        1.0 - 0.5 * spinVariation,
        1.0 + 0.5 * spinVariation
      );
      this.#spinRate[i] = 2.0 * Math.PI * rnd;
    }
  }

  /**
   * Shuffle the permutation array based on the seed.
   * @param {number} seed
   */
  #reinitialize(seed) {
    for (let i = 1; i < this.#N; ++i) {
      const j = FlowNoise2DTime.#randHash(seed++) % (i + 1);
      const dummy = this.#perm[j];
      this.#perm[j] = this.#perm[i];
      this.#perm[i] = dummy;
    }
  }

  /**
   * Returns a permuted index for the basis array.
   * @param {number} i
   * @param {number} j
   * @returns {number}
   */
  #getHashIndex(i, j) {
    const N = this.#N;
    const iWrapped = ((i % N) + N) % N;
    const jWrapped = ((j % N) + N) % N;
    return this.#perm[(this.#perm[iWrapped] + jWrapped) % N];
  }

  /**
   * The current time parameter.
   * @type {number}
   * @readonly
   */
  get time() {
    return this.#lastTime;
  }

  /**
   * Set the time parameter for smooth evolution.
   * Rotates all basis vectors only if t is different from the last time.
   * @param {number} t
   */
  setTime(t) {
    if (t === this.#lastTime) return;
    this.#lastTime = t;
    for (let i = 0; i < this.#N; ++i) {
      const theta = this.#spinRate[i] * t;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const orig = this.#originalBasis[i];
      this.#basis[i].x = c * orig.x + s * orig.y;
      this.#basis[i].y = -s * orig.x + c * orig.y;
    }
  }

  /**
   * Advance the internal time by a delta (incremental time).
   * @param {number} dt
   */
  advanceTime(dt) {
    this.#lastTime += dt;
    for (let i = 0; i < this.#N; ++i) {
      // Precompute increment if dt changed
      if (dt !== this.#dt) {
        this.#rotCos[i] = Math.cos(this.#spinRate[i] * dt);
        this.#rotSin[i] = Math.sin(this.#spinRate[i] * dt);
      }
      const bx = this.#basis[i].x;
      const by = this.#basis[i].y;
      // Apply incremental rotation
      this.#basis[i].x = bx * this.#rotCos[i] + by * this.#rotSin[i];
      this.#basis[i].y = -bx * this.#rotSin[i] + by * this.#rotCos[i];
    }
    this.#dt = dt;
  }

  /**
   * Returns the noise value at (x, y) at current time in [-1, +1].
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  getValue(x, y) {
    const floorX = Math.floor(x);
    const floorY = Math.floor(y);

    const i = floorX;
    const j = floorY;

    const n00 = this.#basis[this.#getHashIndex(i, j)];
    const n10 = this.#basis[this.#getHashIndex(i + 1, j)];
    const n01 = this.#basis[this.#getHashIndex(i, j + 1)];
    const n11 = this.#basis[this.#getHashIndex(i + 1, j + 1)];

    const fx = x - floorX;
    const fy = y - floorY;

    const sx = FlowNoise2DTime.#smoothStep(fx);
    const sy = FlowNoise2DTime.#smoothStep(fy);

    const v00 = fx * n00.x + fy * n00.y;
    const v10 = (fx - 1.0) * n10.x + fy * n10.y;
    const v01 = fx * n01.x + (fy - 1.0) * n01.y;
    const v11 = (fx - 1.0) * n11.x + (fy - 1.0) * n11.y;

    const vlerpX0 = FlowNoise2DTime.#lerp(v00, v10, sx);
    const vlerpX1 = FlowNoise2DTime.#lerp(v01, v11, sx);

    const lerpY = FlowNoise2DTime.#lerp(vlerpX0, vlerpX1, sy);

    return lerpY / 0.7071;
  }
}
