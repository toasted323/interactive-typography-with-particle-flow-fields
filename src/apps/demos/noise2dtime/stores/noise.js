import { writable } from "svelte/store";

// --- Perlin noise params ---
function createPerlinParams() {
  const defaults = { seed: 0 };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setSeed: (seed) => update((obj) => ({ ...obj, seed })),
    reset: () => set({ ...defaults }),
  };
}
export const perlinStore = createPerlinParams();

// --- Flow noise params ---
function createFlowParams() {
  const defaults = {
    seed: 0,
    spinVariation: 0.2,
    N: 128,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setSeed: (seed) => update((obj) => ({ ...obj, seed })),
    setSpinVariation: (spinVariation) =>
      update((obj) => ({ ...obj, spinVariation })),
    setN: (N) => update((obj) => ({ ...obj, N })),
    reset: () => set({ ...defaults }),
  };
}
export const flowStore = createFlowParams();

// --- Noise type ---
export const noiseTypeToStore = {
  PerlinNoise2DTime: perlinStore,
  FlowNoise2DTime: flowStore,
};

export const noiseTypeOptions = [
  { text: "PerlinNoise2DTime", value: "PerlinNoise2DTime" },
  { text: "FlowNoise2DTime", value: "FlowNoise2DTime" },
];

function createNoiseTypeStore() {
  const DEFAULT = "PerlinNoise2DTime";
  const { subscribe, set } = writable(DEFAULT);
  return {
    subscribe,
    set,
    reset: () => set(DEFAULT),
  };
}
export const noiseTypeStore = createNoiseTypeStore();

// --- Frequency and noise speed ---
function createFrequencyStore() {
  const DEFAULT = 0.05;
  const { subscribe, set } = writable(DEFAULT);
  return {
    subscribe,
    set,
    reset: () => set(DEFAULT),
  };
}
export const frequencyStore = createFrequencyStore();

function createNoiseSpeedStore() {
  const DEFAULT = 20.0;
  const { subscribe, set } = writable(DEFAULT);
  return {
    subscribe,
    set,
    reset: () => set(DEFAULT),
  };
}
export const noiseSpeedStore = createNoiseSpeedStore();

// --- Dirty flags ---
function createDirtyFlags() {
  const defaults = {
    PerlinNoise2DTime: false,
    FlowNoise2DTime: false,
    noiseType: false,
    frequency: false,
    noiseSpeed: false,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  perlinStore.subscribe(() =>
    update((flags) => ({ ...flags, PerlinNoise2DTime: true }))
  );
  flowStore.subscribe(() =>
    update((flags) => ({ ...flags, FlowNoise2DTime: true }))
  );
  noiseTypeStore.subscribe(() =>
    update((flags) => ({ ...flags, noiseType: true }))
  );
  frequencyStore.subscribe(() =>
    update((flags) => ({ ...flags, frequency: true }))
  );
  noiseSpeedStore.subscribe(() =>
    update((flags) => ({ ...flags, noiseSpeed: true }))
  );

  function clear(flag) {
    update((flags) => ({ ...flags, [flag]: false }));
  }
  function clearAll() {
    set({ ...defaults });
  }

  return {
    subscribe,
    clear,
    clearAll,
  };
}

export const noiseDirtyFlagsStore = createDirtyFlags();
