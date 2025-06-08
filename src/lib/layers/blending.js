/**
 * Additive blending function.
 * Sums the value of all enabled layers at (x, y).
 * If no layers are enabled, returns 0 (neutral for addition).
 */
export function additiveBlending(layers, x, y) {
  let result = 0;
  let anyEnabled = false;
  for (const layer of layers) {
    if (layer.enabled) {
      result += layer.getValue(x, y);
      anyEnabled = true;
    }
  }
  return anyEnabled ? result : 0;
}

/**
 * Subtract blending function.
 * Subtracts all enabled layers from the first enabled layer.
 * If no layers are enabled, returns 0.
 */
export function subtractBlending(layers, x, y) {
  let result = null;
  for (const layer of layers) {
    if (layer.enabled) {
      const v = layer.getValue(x, y);
      if (result === null) {
        result = v;
      } else {
        result -= v;
      }
    }
  }
  return result !== null ? result : 0;
}

/**
 * Multiplicative blending function.
 * Multiplies all enabled layer values at (x, y).
 * If no layers are enabled, returns 1 (neutral for multiplication).
 */
export function multiplyBlending(layers, x, y) {
  let value = 1;
  let anyEnabled = false;
  for (const layer of layers) {
    if (layer.enabled) {
      value *= layer.getValue(x, y);
      anyEnabled = true;
    }
  }
  return anyEnabled ? value : 1;
}

/**
 * Screen blending function.
 * Lightens by inverting, multiplying, then inverting again.
 * For multiple layers, applies screen recursively.
 * If no layers are enabled, returns 0.
 */
export function screenBlending(layers, x, y) {
  let result = 1;
  let anyEnabled = false;
  for (const layer of layers) {
    if (layer.enabled) {
      result *= 1 - layer.getValue(x, y);
      anyEnabled = true;
    }
  }
  return anyEnabled ? 1 - result : 0;
}

/**
 * Overlay blending function.
 * Mix of multiply and screen, increases contrast.
 * For multiple layers, overlays each subsequent layer atop the previous.
 * If no layers are enabled, returns 0.
 */
export function overlayBlending(layers, x, y) {
  let result = null;
  for (const layer of layers) {
    if (layer.enabled) {
      const v = layer.getValue(x, y);
      if (result === null) {
        result = v;
      } else {
        result = result < 0.5 ? 2 * result * v : 1 - 2 * (1 - result) * (1 - v);
      }
    }
  }
  return result !== null ? result : 0;
}

/**
 * Maximum blending function.
 * Returns the maximum value among all enabled layers at (x, y).
 * If no layers are enabled, returns 0.
 */
export function maxBlending(layers, x, y) {
  let found = false;
  let maxValue = 0;
  for (const layer of layers) {
    if (layer.enabled) {
      const v = layer.getValue(x, y);
      if (!found || v > maxValue) {
        maxValue = v;
        found = true;
      }
    }
  }
  return found ? maxValue : 0;
}

/**
 * Minimum blending function.
 * Returns the minimum value among all enabled layers at (x, y).
 * If no layers are enabled, returns 0.
 */
export function minBlending(layers, x, y) {
  let found = false;
  let minValue = 0;
  for (const layer of layers) {
    if (layer.enabled) {
      const v = layer.getValue(x, y);
      if (!found || v < minValue) {
        minValue = v;
        found = true;
      }
    }
  }
  return found ? minValue : 0;
}

/**
 * Average blending function.
 * Returns the average value of all enabled layers at (x, y).
 * If no layers are enabled, returns 0.
 */
export function averageBlending(layers, x, y) {
  let sum = 0;
  let count = 0;
  for (const layer of layers) {
    if (layer.enabled) {
      sum += layer.getValue(x, y);
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}
