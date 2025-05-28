class Grad {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  dot3(x, y, z) {
    return this.x * x + this.y * y + this.z * z;
  }
}

// 12 gradient directions for 3D Perlin noise
const grad3 = [
  new Grad(1, 1, 0),
  new Grad(-1, 1, 0),
  new Grad(1, -1, 0),
  new Grad(-1, -1, 0),
  new Grad(1, 0, 1),
  new Grad(-1, 0, 1),
  new Grad(1, 0, -1),
  new Grad(-1, 0, -1),
  new Grad(0, 1, 1),
  new Grad(0, -1, 1),
  new Grad(0, 1, -1),
  new Grad(0, -1, -1),
];

// Default permutation table (from Ken Perlin)
const p = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

/**
 * Perlin noise in 2D with smooth time evolution (z axis), based on the canonical "improved Perlin noise" algorithm by Ken Perlin (2002).
 *
 * This implementation uses a fixed set of 12 gradient directions, a permutation table, and a quintic fade function,
 * following the canonical design as seen in:
 *   - https://github.com/josephg/noisejs/blob/master/perlin.js (JavaScript, based on Stefan Gustavson's reference code)
 *   - https://github.com/stegu/perlin-noise (C/Java reference implementation by Stefan Gustavson)
 *
 * The third dimension is interpreted as time, allowing smoothly animated 2D noise fields.
 *
 * Implements the Noise2D API: setTime(t), advanceTime(dt), getValue(x, y).
 * - setTime(t): Sets the current time slice (z axis) for subsequent noise queries.
 * - advanceTime(dt): Advances the internal time parameter by a delta, enabling incremental animation.
 * - getValue(x, y): Returns the noise value at (x, y, t), where t is the most recently set or advanced time.
 *
 * Output is typically in the range [-1, 1], but may slightly exceed these bounds due to interpolation and gradient distribution.
 *
 * References:
 * - Ken Perlin, "Improving Noise", 2002.
 * - https://github.com/stegu/perlin-noise
 * - https://github.com/josephg/noisejs/
 *
 * @implements {Noise2DTime}
 */
export class PerlinNoise2DTime {
  #perm = new Array(512);
  #gradP = new Array(512);
  #time = 0;

  /**
   * @param {object} [opts]
   * @param {number} [opts.seed] - Integer seed for permutation table.
   */
  constructor(opts = {}) {
    const { seed } = opts;
    this.#init(seed);
  }

  /**
   * The current time parameter.
   * @type {number}
   * @readonly
   */
  get time() {
    return this.#time;
  }

  /**
   * Set the time parameter for smooth evolution.
   * @param {number} t
   */
  setTime(t) {
    this.#time = t;
  }

  /**
   * Advance the internal time by a delta (incremental time).
   * @param {number} dt - Time delta to advance
   */
  advanceTime(dt) {
    this.#time += dt;
  }

  /**
   * Returns the Perlin noise value at (x, y) for the current time.
   * Output is in approximately [-1, 1], but may slightly exceed due to interpolation.
   * @param {number} x
   * @param {number} y
   * @returns {number}
   */
  getValue(x, y) {
    return this.#perlin3(x, y, this.#time);
  }

  #init(seed) {
    let perm = this.#perm,
      gradP = this.#gradP;
    let sourceP = p.slice();
    // If no seed, use default table
    if (typeof seed !== "number") {
      for (let i = 0; i < 512; i++) {
        perm[i] = sourceP[i & 255];
        gradP[i] = grad3[perm[i] % 12];
      }
    } else {
      // Seeded shuffle (simple LCG)
      let lcg = (s) => () =>
        (s = (s * 1664525 + 1013904223) & 0xffffffff) >>> 0;
      let rand = lcg(seed);
      for (let i = 255; i > 0; i--) {
        let j = rand() % (i + 1);
        [sourceP[i], sourceP[j]] = [sourceP[j], sourceP[i]];
      }
      for (let i = 0; i < 512; i++) {
        perm[i] = sourceP[i & 255];
        gradP[i] = grad3[perm[i] % 12];
      }
    }
  }

  static #fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  static #lerp(a, b, t) {
    return a + t * (b - a);
  }

  #perlin3(x, y, z) {
    // Find unit grid cell containing point
    let X = Math.floor(x),
      Y = Math.floor(y),
      Z = Math.floor(z);
    x -= X;
    y -= Y;
    z -= Z;
    X &= 255;
    Y &= 255;
    Z &= 255;

    // Hash coordinates of the 8 cube corners
    const gradP = this.#gradP,
      perm = this.#perm;
    const n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
    const n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
    const n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
    const n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
    const n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
    const n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
    const n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
    const n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(
      x - 1,
      y - 1,
      z - 1
    );

    // Compute fade curves for each coordinate
    const u = PerlinNoise2DTime.#fade(x);
    const v = PerlinNoise2DTime.#fade(y);
    const w = PerlinNoise2DTime.#fade(z);

    // Interpolate
    return PerlinNoise2DTime.#lerp(
      PerlinNoise2DTime.#lerp(
        PerlinNoise2DTime.#lerp(n000, n100, u),
        PerlinNoise2DTime.#lerp(n001, n101, u),
        w
      ),
      PerlinNoise2DTime.#lerp(
        PerlinNoise2DTime.#lerp(n010, n110, u),
        PerlinNoise2DTime.#lerp(n011, n111, u),
        w
      ),
      v
    );
  }
}
