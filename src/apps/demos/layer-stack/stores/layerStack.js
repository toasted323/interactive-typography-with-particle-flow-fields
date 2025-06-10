import { writable } from "svelte/store";

export const blendingOptions = [
  { text: "Additive", value: "additive" },
  { text: "Subtract", value: "subtract" },
  { text: "Multiply", value: "multiply" },
  { text: "Screen", value: "screen" },
  { text: "Overlay", value: "overlay" },
  { text: "Max", value: "max" },
  { text: "Min", value: "min" },
  { text: "Average", value: "average" },
];

function createLayerStackParams() {
  const defaults = {
    blendingMode: "additive",
  };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setBlendingMode(mode) {
      update((state) => ({ ...state, blendingMode: mode }));
    },
    reset() {
      set({ ...defaults });
    },
  };
}

export const layerStackStore = createLayerStackParams();
