import { writable } from "svelte/store";

// --- Typography layer params ---
function createTypographyLayerParams() {
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

export const typographyLayerStore = createTypographyLayerParams();

function createTypographyLayerDirtyFlag() {
  const { subscribe, set } = writable(true); // initially dirty

  typographyLayerStore.subscribe(() => set(true));

  function clear() {
    set(false);
  }

  return {
    subscribe,
    clear,
  };
}

export const typographyLayerDirtyFlagStore = createTypographyLayerDirtyFlag();
