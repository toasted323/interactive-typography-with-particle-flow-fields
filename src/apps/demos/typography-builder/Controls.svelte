<script>
    import {
    Pane,
    Folder,
    Slider,
    List,
    Checkbox,
    Color,
    Text,
    } from "svelte-tweakpane-ui";
    import {
    fontFamilyOptions,
    typographyStore,
    } from "$apps/shared/stores/typography.js";

    const gradientLabels = [
    "Gradient Color 1",
    "Gradient Color 2",
    "Gradient Color 3",
    ];
</script>

<Pane title="Typography Controls">
  <Folder title="Text" expanded={true}>
    <Text
      value={$typographyStore.text}
      label="Text"
      on:change={(e) => typographyStore.setText(e.detail.value)}
    />
    <List
      value={$typographyStore.fontFamily}
      label="Font Family"
      options={fontFamilyOptions}
      on:change={(e) => typographyStore.setFontFamily(e.detail.value)}
    />
    <Checkbox
      value={$typographyStore.fontSizeAuto}
      label="Auto Font Size"
      on:change={(e) => typographyStore.setFontSizeAuto(e.detail.value)}
    />
    <Slider
      value={$typographyStore.padding}
      label="Padding for Auto Font Size"
      min={0}
      max={100}
      step={1}
      disabled={!$typographyStore.fontSizeAuto}
      on:change={(e) => typographyStore.setPadding(e.detail.value)}
    />
    <Slider
      value={$typographyStore.fontSizeManual}
      label="Manual Font Size"
      min={8}
      max={200}
      step={1}
      disabled={$typographyStore.fontSizeAuto}
      on:change={(e) => typographyStore.setFontSizeManual(e.detail.value)}
    />
  </Folder>

  <Folder title="Fill & Stroke" expanded={true}>
    <Color
      value={$typographyStore.fillStyle}
      label="Fill Style"
      on:change={(e) => typographyStore.setFillStyle(e.detail.value)}
    />
    <Color
      value={$typographyStore.strokeStyle}
      label="Stroke Style"
      on:change={(e) => typographyStore.setStrokeStyle(e.detail.value)}
    />
    <Slider
      value={$typographyStore.strokeWidth}
      label="Stroke Width"
      min={0}
      max={10}
      step={1}
      on:change={(e) => typographyStore.setStrokeWidth(e.detail.value)}
    />
    <Checkbox
      value={$typographyStore.useGradient}
      label="Use Gradient Fill"
      on:change={(e) => typographyStore.setUseGradient(e.detail.value)}
    />
    {#each [0, 1, 2] as idx}
      <Color
        value={$typographyStore.gradientColors[idx]}
        label={gradientLabels[idx]}
        on:change={(e) => {
          const newColors = [...$typographyStore.gradientColors];
          newColors[idx] = e.detail.value;
          typographyStore.setGradientColors(newColors);
        }}
      />
    {/each}
  </Folder>

  <Folder title="Glow & Shadow" expanded={true}>
    <Color
      value={$typographyStore.glowColor}
      label="Glow Color"
      on:change={(e) => typographyStore.setGlowColor(e.detail.value)}
    />
    <Slider
      value={$typographyStore.glowSize}
      label="Glow Size"
      min={0}
      max={100}
      step={1}
      on:change={(e) => typographyStore.setGlowSize(e.detail.value)}
    />
    <Slider
      value={$typographyStore.shadowOffsetX}
      label="Shadow Offset X"
      min={-50}
      max={50}
      step={1}
      on:change={(e) => typographyStore.setShadowOffsetX(e.detail.value)}
    />
    <Slider
      value={$typographyStore.shadowOffsetY}
      label="Shadow Offset Y"
      min={-50}
      max={50}
      step={1}
      on:change={(e) => typographyStore.setShadowOffsetY(e.detail.value)}
    />
  </Folder>

  <Folder title="Blur" expanded={true}>
    <Slider
      value={$typographyStore.blurAmount}
      label="Blur Amount"
      min={0}
      max={50}
      step={1}
      on:change={(e) => typographyStore.setBlurAmount(e.detail.value)}
    />
  </Folder>

  <Folder title="Inner Glow" expanded={true}>
    <Color
      value={$typographyStore.innerGlowColor}
      label="Inner Glow Color"
      on:change={(e) => typographyStore.setInnerGlowColor(e.detail.value)}
    />
    <Slider
      value={$typographyStore.innerGlowBlur}
      label="Inner Glow Blur"
      min={0}
      max={50}
      step={1}
      on:change={(e) => typographyStore.setInnerGlowBlur(e.detail.value)}
    />
  </Folder>

  <Folder title="Background" expanded={true}>
    <Color
      value={$typographyStore.backgroundColor}
      label="Background Color"
      on:change={(e) => typographyStore.setBackgroundColor(e.detail.value)}
    />
  </Folder>
</Pane>
