import { writable } from "svelte/store";

// --- Null noise params ---
function createNullNoiseParams() {
  const defaults = {}; // No params
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    reset: () => set({ ...defaults }),
  };
}

export const nullNoiseStore = createNullNoiseParams();

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

// --- FBM noise params ---
function createFBMParams() {
  const defaults = {
    baseType: "PerlinNoise2DTime",
    perlinBaseParams: {
      seed: 0,
    },
    flowBaseParams: {
      seed: 0,
      spinVariation: 0.2,
      N: 128,
    },
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setBaseType: (baseType) => update((obj) => ({ ...obj, baseType })),
    setPerlinBaseParams: (perlinBaseParams) =>
      update((obj) => ({ ...obj, perlinBaseParams })),
    setFlowBaseParams: (flowBaseParams) =>
      update((obj) => ({ ...obj, flowBaseParams })),
    setOctaves: (octaves) => update((obj) => ({ ...obj, octaves })),
    setPersistence: (persistence) => update((obj) => ({ ...obj, persistence })),
    setLacunarity: (lacunarity) => update((obj) => ({ ...obj, lacunarity })),
    reset: () => set({ ...defaults }),
  };
}

export const fbmStore = createFBMParams();

// --- Turbulence noise params ---
function createTurbulenceParams() {
  const defaults = {
    baseType: "PerlinNoise2DTime",
    perlinBaseParams: {
      seed: 0,
    },
    flowBaseParams: {
      seed: 0,
      spinVariation: 0.2,
      N: 128,
    },
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  return {
    subscribe,
    set,
    update,
    setBaseType: (baseType) => update((obj) => ({ ...obj, baseType })),
    setPerlinBaseParams: (perlinBaseParams) =>
      update((obj) => ({ ...obj, perlinBaseParams })),
    setFlowBaseParams: (flowBaseParams) =>
      update((obj) => ({ ...obj, flowBaseParams })),
    setOctaves: (octaves) => update((obj) => ({ ...obj, octaves })),
    setPersistence: (persistence) => update((obj) => ({ ...obj, persistence })),
    setLacunarity: (lacunarity) => update((obj) => ({ ...obj, lacunarity })),
    reset: () => set({ ...defaults }),
  };
}

export const turbulenceStore = createTurbulenceParams();

// --- Noise type ---
export const noiseTypeToStore = {
  NullNoise: nullNoiseStore,
  PerlinNoise2DTime: perlinStore,
  FlowNoise2DTime: flowStore,
  FBMNoise2DTime: fbmStore,
  TurbulenceNoise2DTime: turbulenceStore,
};

export const noiseTypeOptions = [
  { text: "PerlinNoise2DTime", value: "PerlinNoise2DTime" },
  { text: "FlowNoise2DTime", value: "FlowNoise2DTime" },
  { text: "FBMNoise2DTime", value: "FBMNoise2DTime" },
  { text: "TurbulenceNoise2DTime", value: "TurbulenceNoise2DTime" },
];

function createNoiseTypeParam() {
  const DEFAULT = "PerlinNoise2DTime";
  const { subscribe, set } = writable(DEFAULT);
  return {
    subscribe,
    set,
    reset: () => set(DEFAULT),
  };
}

export const noiseTypeStore = createNoiseTypeParam();

// --- Dirty flags ---
function createNoiseDirtyFlags() {
  const defaults = {
    PerlinNoise2DTime: false,
    FlowNoise2DTime: false,
    FBMNoise2DTime: false,
    TurbulenceNoise2DTime: false,
    noiseType: false,
  };
  const { subscribe, set, update } = writable({ ...defaults });
  perlinStore.subscribe(() =>
    update((flags) => ({ ...flags, PerlinNoise2DTime: true }))
  );
  flowStore.subscribe(() =>
    update((flags) => ({ ...flags, FlowNoise2DTime: true }))
  );
  fbmStore.subscribe(() =>
    update((flags) => ({ ...flags, FBMNoise2DTime: true }))
  );
  turbulenceStore.subscribe(() =>
    update((flags) => ({ ...flags, TurbulenceNoise2DTime: true }))
  );
  noiseTypeStore.subscribe(() =>
    update((flags) => ({ ...flags, noiseType: true }))
  );

  function clear(flag) {
    update((flags) => ({ ...flags, [flag]: false }));
  }

  function clearAll() {
    set({...defaults});
  }

  return {
    subscribe,
    clear,
    clearAll,
  };
}

export const noiseDirtyFlagsStore = createNoiseDirtyFlags();
