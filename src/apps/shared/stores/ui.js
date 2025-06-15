import { writable } from "svelte/store";

export const COLOR_MODE = Object.freeze({
  GRAYSCALE: "grayscale",
  HEIGHT_BANDS: "heightbands",
  GEOGRAPHICAL: "geographical",
});

export const colorModeOptions = [
  { text: "Grayscale", value: COLOR_MODE.GRAYSCALE },
  { text: "Height Bands", value: COLOR_MODE.HEIGHT_BANDS },
  { text: "Geographical", value: COLOR_MODE.GEOGRAPHICAL },
];
function createUIParams() {
  const defaults = {
    colorMode: "grayscale",
    showScaleVisualization: true,
  };
  const { subscribe, set, update } = writable({ ...defaults });

  return {
    subscribe,
    set,
    update,
    setColorMode: (colorMode) => update((state) => ({ ...state, colorMode })),
    setShowScaleVisualization: (show) =>
      update((state) => ({ ...state, showScaleVisualization: show })),
    reset: () => set({ ...defaults }),
  };
}

export const uiStore = createUIParams();
