import { randHash } from "./Rng.js";

/**
 * Returns all (x, y) locations within [width, height] where layer.getValue(x, y) > threshold.
 *
 * @param {Layer} layer - The layer to sample.
 * @param {number} threshold - Normalized threshold [0,1].
 * @param {number} width - The width of the layer.
 * @param {number} height - The height of the layer.
 * @returns {{x: number, y: number}[]} Array of integer coordinate objects.
 */
export function getActiveLocations(layer, threshold, width, height) {
  const result = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (layer.getValue(x, y) > threshold) {
        result.push({ x, y });
      }
    }
  }
  return result;
}

/**
 * Returns the bounding box of all (x, y) where layer.getValue(x, y) > threshold.
 *
 * @param {Layer} layer - The layer to sample.
 * @param {number} threshold - Normalized threshold [0,1].
 * @param {number} width - The width of the layer.
 * @param {number} height - The height of the layer.
 * @returns {{minX: number, minY: number, maxX: number, maxY: number}|null} The bounding box or null if no active pixels.
 */
export function getActiveBoundary(layer, threshold, width, height) {
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (layer.getValue(x, y) > threshold) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        found = true;
      }
    }
  }
  return found ? { minX, minY, maxX, maxY } : null;
}

/**
 * Generator yielding random (x, y) locations where layer.getValue(x, y) > threshold,
 * using a deterministic RNG seeded by `seed`.
 * The yielded {x, y} objects always have integer coordinates.
 *
 * @param {Layer} layer - The layer to sample.
 * @param {number} threshold - Normalized threshold [0,1].
 * @param {number} width - The width of the layer.
 * @param {number} height - The height of the layer.
 * @param {number} seed - The seed for deterministic random number generation.
 * @param {number} [maxTries=10000] - Maximum attempts to find an active pixel.
 * @yields {{x: number, y: number}} integer coordinates of an active location.
 */
export function* randomActiveLocationGenerator(
  layer,
  threshold,
  width,
  height,
  seed,
  maxTries = 10000
) {
  let tries = 0;
  let localSeed = seed;
  while (tries < maxTries) {
    localSeed = randHash(localSeed);
    const x = randHash(localSeed) % width;
    localSeed = randHash(localSeed);
    const y = randHash(localSeed) % height;
    if (layer.getValue(x, y) > threshold) {
      yield { x, y };
    }
    tries++;
    localSeed = randHash(localSeed);
  }
}

/**
 * Generator yielding random (x, y) locations within the given boundary,
 * using a deterministic RNG seeded by `seed`.
 * The yielded {x, y} objects always have integer coordinates.
 * The boundary is an object: {minX, minY, maxX, maxY}, inclusive.
 *
 * @param {{minX: number, minY: number, maxX: number, maxY: number}} boundary - The inclusive rectangle boundary.
 * @param {number} seed - The seed for deterministic random number generation.
 * @param {number} [count=Infinity] - Maximum number of locations to yield (optional).
 * @yields {{x: number, y: number}} integer coordinates within the boundary.
 */
export function* randomLocationWithinBoundaryGenerator(
  boundary,
  seed,
  count = Infinity
) {
  const { minX, minY, maxX, maxY } = boundary;
  let yielded = 0;
  let localSeed = seed;
  while (yielded < count) {
    localSeed = randHash(localSeed);
    const x = minX + (randHash(localSeed) % (maxX - minX + 1));
    localSeed = randHash(localSeed);
    const y = minY + (randHash(localSeed) % (maxY - minY + 1));
    yield { x, y };
    yielded++;
    localSeed = randHash(localSeed);
  }
}
