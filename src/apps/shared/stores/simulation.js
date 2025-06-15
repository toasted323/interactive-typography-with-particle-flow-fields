import { writable } from "svelte/store";

function createSimulationParams() {
  const defaults = {
    animating: true,
    timeScale: 1,
    useAdvanceTime: false,
  };
  const { subscribe, set, update } = writable({ ...defaults });

  return {
    subscribe,
    set,
    update,
    setSpeed(timeScale) {
      update((state) => ({ ...state, timeScale }));
    },
    setAnimating(animating) {
      update((state) => ({ ...state, animating }));
    },
    setUseAdvanceTime(useAdvanceTime) {
      update((state) => ({ ...state, useAdvanceTime }));
    },
    reset() {
      set({ ...defaults });
    },
  };
}

export const simulationStore = createSimulationParams();
