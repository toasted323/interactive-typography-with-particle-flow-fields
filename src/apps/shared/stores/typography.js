import { writable } from "svelte/store";

export const FONT_FAMILIES = Object.freeze({
  ARIAL: "Arial",
  VERDANA: "Verdana",
  TIMES_NEW_ROMAN: "Times New Roman",
});

export const fontFamilyOptions = [
  { text: "Arial", value: FONT_FAMILIES.ARIAL },
  { text: "Verdana", value: FONT_FAMILIES.VERDANA },
  { text: "Times New Roman", value: FONT_FAMILIES.TIMES_NEW_ROMAN },
];

function createTypographyParams() {
  const defaults = {
    text: "Hello World",
    fontFamily: FONT_FAMILIES.ARIAL,
    fontSizeAuto: true,
    fontSizeManual: 48,
    padding: 20,
    fillStyle: "#0000ff",
    strokeStyle: "#000099",
    strokeWidth: 3,
    glowColor: "#0000cc",
    glowSize: 10,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    blurAmount: 3,
    innerGlowColor: "#000044",
    innerGlowBlur: 0,
    backgroundColor: "#000000",
    gradientColors: ["#000066", "#0000ff", "#000066"],
    useGradient: false,
  };
  const { subscribe, set, update } = writable({ ...defaults });

  return {
    subscribe,
    set,
    update,
    setText: (text) => update((obj) => ({ ...obj, text })),
    setFontFamily: (fontFamily) => update((obj) => ({ ...obj, fontFamily })),
    setFontSizeAuto: (fontSizeAuto) =>
      update((obj) => ({ ...obj, fontSizeAuto })),
    setFontSizeManual: (fontSizeManual) =>
      update((obj) => ({ ...obj, fontSizeManual })),
    setPadding: (padding) => update((obj) => ({ ...obj, padding })),
    setFillStyle: (fillStyle) => update((obj) => ({ ...obj, fillStyle })),
    setStrokeStyle: (strokeStyle) => update((obj) => ({ ...obj, strokeStyle })),
    setStrokeWidth: (strokeWidth) => update((obj) => ({ ...obj, strokeWidth })),
    setGlowColor: (glowColor) => update((obj) => ({ ...obj, glowColor })),
    setGlowSize: (glowSize) => update((obj) => ({ ...obj, glowSize })),
    setShadowOffsetX: (shadowOffsetX) =>
      update((obj) => ({ ...obj, shadowOffsetX })),
    setShadowOffsetY: (shadowOffsetY) =>
      update((obj) => ({ ...obj, shadowOffsetY })),
    setBlurAmount: (blurAmount) => update((obj) => ({ ...obj, blurAmount })),
    setInnerGlowColor: (innerGlowColor) =>
      update((obj) => ({ ...obj, innerGlowColor })),
    setInnerGlowBlur: (innerGlowBlur) =>
      update((obj) => ({ ...obj, innerGlowBlur })),
    setBackgroundColor: (backgroundColor) =>
      update((obj) => ({ ...obj, backgroundColor })),
    setGradientColors: (gradientColors) =>
      update((obj) => ({ ...obj, gradientColors })),
    setUseGradient: (useGradient) => update((obj) => ({ ...obj, useGradient })),
    reset: () => set({ ...defaults }),
  };
}

export const typographyStore = createTypographyParams();

// --- Dirty flags ---
function createTypographyDirtyFlag() {
  const { subscribe, set } = writable(true); // initially dirty

  typographyStore.subscribe(() => set(true));

  function clear() {
    set(false);
  }

  return {
    subscribe,
    clear,
  };
}

export const typographyDirtyFlagStore = createTypographyDirtyFlag();
