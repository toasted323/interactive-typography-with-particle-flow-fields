/**
 * Generates a deterministic pseudo-random unsigned 32-bit integer from a seed.
 *
 * This function implements a simple integer hash algorithm using bitwise operations
 * and integer multiplication.
 *
 * @param {number} seed - The input seed.
 * @returns {number} The hashed unsigned integer.
 */
export function randHash(seed) {
  let i = (seed ^ 12345391) * 2654435769;
  i ^= (i << 6) ^ (i >>> 26);
  i = (i * 2654435769) >>> 0;
  i += (i << 5) ^ (i >>> 12);
  return i >>> 0; // Hack to snsure unsigned 32-bit
}

/**
 * Generates a deterministic pseudo-random float in [0,1) from a seed.
 * @param {number} seed - The input seed.
 * @returns {number} The pseudo-random float.
 */
export function randHashF(seed) {
  return randHash(seed) / 0xffffffff;
}

/**
 * Generates a deterministic pseudo-random float in [a, b) from a seed.
 * @param {number} seed - The input seed.
 * @param {number} a - Lower bound.
 * @param {number} b - Upper bound.
 * @returns {number} The pseudo-random float in [a, b).
 */
export function randHashFInterval(seed, a, b) {
  return ((b - a) * randHash(seed)) / 0xffffffff + a;
}
