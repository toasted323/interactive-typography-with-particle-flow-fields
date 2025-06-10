import { writable } from "svelte/store";

function createSimulationParams() {
  const defaults = {
    animating: true,
    speed: 1,
    useAdvanceTime: false,
  };
  const { subscribe, set, update } = writable({ ...defaults });

  return {
    subscribe,
    set,
    update,
    setSpeed(speed) {
      update((state) => ({ ...state, speed }));
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
