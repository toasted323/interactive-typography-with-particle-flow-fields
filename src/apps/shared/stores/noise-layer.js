import { writable } from "svelte/store";

// --- Noise layer ---
function createNoiseLayerStore() {
  const defaults = {
    enabled: true,
    gain: 1,
    frequency: 0.05,
    noiseTimeScale: 20.0,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setEnabled(enabled) {
      update((state) => ({ ...state, enabled }));
    },
    setGain(gain) {
      update((state) => ({ ...state, gain }));
    },
    setFrequency(frequency) {
      update((state) => ({ ...state, frequency }));
    },
    setNoiseTimeScale(noiseTimeScale) {
      update((state) => ({ ...state, noiseTimeScale }));
    },
    reset() {
      set({ ...defaults });
    },
  };
}

export const noiseLayerStore = createNoiseLayerStore();

function createNoiseLayerDirtyFlagStore() {
  const { subscribe, set } = writable(false);

  noiseLayerStore.subscribe(() => set(true));

  function clear() {
    set(false);
  }

  return {
    subscribe,
    clear,
  };
}

export const noiseLayerDirtyFlagStore = createNoiseLayerDirtyFlagStore();
