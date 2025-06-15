import { writable } from "svelte/store";

function createNoiseSamplingStore() {
  const defaults = {
    frequency: 0.05,
    timeScale: 20.0,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setFrequency: (frequency) => update((obj) => ({ ...obj, frequency })),
    setTimeScale: (timeScale) => update((obj) => ({ ...obj, timeScale })),
    reset: () => set({ ...defaults }),
  };
}

export const noiseSamplingStore = createNoiseSamplingStore();

function createNoiseSamplingDirtyFlagStore() {
  const { subscribe, set } = writable(true); // initially dirty

  noiseSamplingStore.subscribe(() => set(true));

  function clear() {
    set(false);
  }

  return {
    subscribe,
    clear,
  };
}

export const noiseSamplingDirtyFlagsStore = createNoiseSamplingDirtyFlagStore();
