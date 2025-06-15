import { writable } from "svelte/store";

function createNoiseLayerStore() {
  const defaults = {
    enabled: true,
    gain: 1,
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
