import { writable } from "svelte/store";

function createMaskLayerStore() {
  const defaults = {
    enableMasking: true,
    radius: 100,
    fadeOutDuration: 1.0,
    autoFadeDuration: 1.0,
  };
  const { subscribe, set, update } = writable({ ...defaults });

  return {
    subscribe,
    set,
    update,
    setEnableMasking(enableMasking) {
      update((state) => ({ ...state, enableMasking }));
    },
    setRadius(radius) {
      update((state) => ({ ...state, radius }));
    },
    setFadeOutDuration(fadeOutDuration) {
      update((state) => ({ ...state, fadeOutDuration }));
    },
    setAutoFadeDuration(autoFadeDuration) {
      update((state) => ({ ...state, autoFadeDuration }));
    },
    reset() {
      set({ ...defaults });
    },
  };
}

export const maskLayerStore = createMaskLayerStore();
