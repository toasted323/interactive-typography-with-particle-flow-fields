<script>
  import { get } from "svelte/store";
  import {
    Pane,
    Folder,
    Slider,
    List,
    Checkbox,
    Button,
    Color,
    Text,
  } from "svelte-tweakpane-ui";

  import { layerStackStore, blendingOptions } from "./stores/layerStack.js";
  import { maskLayerStore } from "./stores/maskLayer.js";
  import {
    noiseLayerStore,
    noiseTypeStore,
    noiseTypeOptions,
    perlinStore,
    flowStore,
    fbmStore,
    turbulenceStore,
  } from "./stores/noiseLayer.js";
  import {
    typographyLayerStore,
    fontFamilyOptions,
    typographyStore,
  } from "./stores/typographyLayer.js";
  import { simulationStore } from "./stores/simulation.js";
  import { COLOR_MODE, colorModeOptions, uiStore } from "./stores/ui.js";

  const gradientLabels = [
    "Gradient Color 1",
    "Gradient Color 2",
    "Gradient Color 3",
  ];

  function resetAll() {
    layerStackStore.reset();

    // --- Mask layer ---
    maskLayerStore.reset();

    // --- Noise layer ---
    noiseLayerStore.reset();
    noiseTypeStore.reset();
    perlinStore.reset();
    flowStore.reset();
    fbmStore.reset();
    turbulenceStore.reset();

    // --- Typography layer ---
    typographyLayerStore.reset();
    typographyStore.reset();

    // --- Simulation ---
    simulationStore.reset();

    // --- UI ---
    uiStore.reset();
  }
</script>

<Pane>
  <Folder title="Layer Stack">
    <List
      label="Blending Mode"
      value={$layerStackStore.blendingMode}
      options={blendingOptions}
      on:change={(e) => layerStackStore.setBlendingMode(e.detail.value)}
    />

    <Folder title="Mask Layer" expanded={false}>
      <Checkbox
        label="Enable Masking"
        value={$maskLayerStore.enableMasking}
        on:change={(e) => maskLayerStore.setEnableMasking(e.detail.value)}
      />
      <Slider
        label="Radius"
        min={0}
        max={500}
        step={1}
        value={$maskLayerStore.radius}
        on:change={(e) => maskLayerStore.setRadius(e.detail.value)}
      />
      <Slider
        label="Fade Out Duration"
        min={0}
        max={10}
        step={0.01}
        value={$maskLayerStore.fadeOutDuration}
        on:change={(e) => maskLayerStore.setFadeOutDuration(e.detail.value)}
      />
      <Slider
        label="Auto Fade Duration"
        min={0}
        max={10}
        step={0.01}
        value={$maskLayerStore.autoFadeDuration}
        on:change={(e) => maskLayerStore.setAutoFadeDuration(e.detail.value)}
      />
    </Folder>

    <Folder title="Noise Layer" expanded={false}>
      <Checkbox
        label="Layer Enabled"
        value={$noiseLayerStore.enabled}
        on:change={(e) => noiseLayerStore.setEnabled(e.detail.value)}
      />
      <Slider
        label="Gain"
        min={0}
        max={20}
        step={0.1}
        value={$noiseLayerStore.gain}
        on:change={(e) => noiseLayerStore.setGain(e.detail.value)}
      />
      <List
        label="Noise Type"
        bind:value={$noiseTypeStore}
        options={noiseTypeOptions}
      />

      {#if $noiseTypeStore === "PerlinNoise2DTime"}
        <Folder title="PerlinNoise2DTime Params">
          <Slider
            label="Seed"
            value={$perlinStore.seed}
            min={0}
            max={4294967295}
            step={1}
            on:change={(e) => perlinStore.setSeed(e.detail.value)}
          />
        </Folder>
      {/if}

      {#if $noiseTypeStore === "FlowNoise2DTime"}
        <Folder title="FlowNoise2DTime Params">
          <Slider
            label="Seed"
            value={$flowStore.seed}
            min={0}
            max={4294967295}
            step={1}
            on:change={(e) => flowStore.setSeed(e.detail.value)}
          />
          <Slider
            label="Spin Variation"
            value={$flowStore.spinVariation}
            min={0}
            max={1}
            step={0.01}
            on:change={(e) => flowStore.setSpinVariation(e.detail.value)}
          />
          <Slider
            label="N"
            value={$flowStore.N}
            min={1}
            max={512}
            step={1}
            on:change={(e) => flowStore.setN(e.detail.value)}
          />
        </Folder>
      {/if}

      {#if $noiseTypeStore === "FBMNoise2DTime"}
        <Folder title="FBMNoise2DTime Params">
          <List
            label="Base Type"
            value={$fbmStore.baseType}
            options={[
              { text: "PerlinNoise2DTime", value: "PerlinNoise2DTime" },
              { text: "FlowNoise2DTime", value: "FlowNoise2DTime" },
            ]}
            on:change={(e) => fbmStore.setBaseType(e.detail.value)}
          />

          {#if $fbmStore.baseType === "PerlinNoise2DTime"}
            <Folder title="Perlin Base Params">
              <Slider
                label="Seed"
                value={$fbmStore.perlinBaseParams.seed}
                min={0}
                max={4294967295}
                step={1}
                on:change={(e) =>
                  fbmStore.setPerlinBaseParams({
                    ...$turbulenceStore.perlinBaseParams,
                    seed: e.detail.value,
                  })}
              />
            </Folder>
          {:else if $fbmStore.baseType === "FlowNoise2DTime"}
            <Folder title="Flow Base Params">
              <Slider
                label="Flow Seed"
                value={$fbmStore.flowBaseParams.seed}
                min={0}
                max={4294967295}
                step={1}
                on:change={(e) =>
                  fbmStore.setFlowBaseParams({
                    ...$fbmStore.flowBaseParams,
                    seed: e.detail.value,
                  })}
              />
              <Slider
                label="Spin Variation"
                value={$fbmStore.flowBaseParams.spinVariation}
                min={0}
                max={1}
                step={0.01}
                on:change={(e) =>
                  fbmStore.setFlowBaseParams({
                    ...$fbmStore.flowBaseParams,
                    spinVariation: e.detail.value,
                  })}
              />
              <Slider
                label="N"
                value={$flowStore.N}
                min={1}
                max={512}
                step={1}
                on:change={(e) => flowStore.setN(e.detail.value)}
              />
            </Folder>
          {/if}

          <Folder title="Octave Params">
            <Slider
              label="Octaves"
              value={$fbmStore.octaves}
              min={1}
              max={8}
              step={1}
              on:change={(e) => fbmStore.setOctaves(e.detail.value)}
            />
            <Slider
              label="Persistence"
              value={$fbmStore.persistence}
              min={0}
              max={1}
              step={0.01}
              on:change={(e) => fbmStore.setPersistence(e.detail.value)}
            />
            <Slider
              label="Lacunarity"
              value={$fbmStore.lacunarity}
              min={1}
              max={4}
              step={0.01}
              on:change={(e) => fbmStore.setLacunarity(e.detail.value)}
            />
          </Folder>
        </Folder>
      {/if}

      {#if $noiseTypeStore === "TurbulenceNoise2DTime"}
        <Folder title="TurbulenceNoise2DTime Params">
          <List
            label="Base Type"
            value={$turbulenceStore.baseType}
            options={[
              { text: "PerlinNoise2DTime", value: "PerlinNoise2DTime" },
              { text: "FlowNoise2DTime", value: "FlowNoise2DTime" },
            ]}
            on:change={(e) => turbulenceStore.setBaseType(e.detail.value)}
          />

          {#if $turbulenceStore.baseType === "PerlinNoise2DTime"}
            <Folder title="Perlin Base Params">
              <Slider
                label="Seed"
                value={$turbulenceStore.perlinBaseParams.seed}
                min={0}
                max={4294967295}
                step={1}
                on:change={(e) =>
                  turbulenceStore.setPerlinBaseParams({
                    ...$turbulenceStore.perlinBaseParams,
                    seed: e.detail.value,
                  })}
              />
            </Folder>
          {:else if $turbulenceStore.baseType === "FlowNoise2DTime"}
            <Folder title="Flow Base Params">
              <Slider
                label="Flow Seed"
                value={$turbulenceStore.flowBaseParams.seed}
                min={0}
                max={4294967295}
                step={1}
                on:change={(e) =>
                  turbulenceStore.setFlowBaseParams({
                    ...$turbulenceStore.flowBaseParams,
                    seed: e.detail.value,
                  })}
              />
              <Slider
                label="Spin Variation"
                value={$turbulenceStore.flowBaseParams.spinVariation}
                min={0}
                max={1}
                step={0.01}
                on:change={(e) =>
                  turbulenceStore.setFlowBaseParams({
                    ...$turbulenceStore.flowBaseParams,
                    spinVariation: e.detail.value,
                  })}
              />
              <Slider
                label="N"
                value={$flowStore.N}
                min={1}
                max={512}
                step={1}
                on:change={(e) => flowStore.setN(e.detail.value)}
              />
            </Folder>
          {/if}

          <Folder title="Octave Params">
            <Slider
              label="Octaves"
              value={$turbulenceStore.octaves}
              min={1}
              max={8}
              step={1}
              on:change={(e) => turbulenceStore.setOctaves(e.detail.value)}
            />
            <Slider
              label="Persistence"
              value={$turbulenceStore.persistence}
              min={0}
              max={1}
              step={0.01}
              on:change={(e) => turbulenceStore.setPersistence(e.detail.value)}
            />
            <Slider
              label="Lacunarity"
              value={$turbulenceStore.lacunarity}
              min={1}
              max={4}
              step={0.01}
              on:change={(e) => turbulenceStore.setLacunarity(e.detail.value)}
            />
          </Folder>
        </Folder>
      {/if}

      <Slider
        label="Frequency"
        min={0.001}
        max={1}
        step={0.001}
        value={$noiseLayerStore.frequency}
        on:change={(e) => noiseLayerStore.setFrequency(e.detail.value)}
      />
      <Slider
        label="Noise Time Scale"
        min={0.1}
        max={1000}
        step={0.1}
        value={$noiseLayerStore.noiseTimeScale}
        on:change={(e) => noiseLayerStore.setNoiseTimeScale(e.detail.value)}
      />
    </Folder>

    <Folder title="Typography Layer" expanded={false}>
      <Checkbox
        label="Layer Enabled"
        value={$typographyLayerStore.enabled}
        on:change={(e) => typographyLayerStore.setEnabled(e.detail.value)}
      />
      <Slider
        label="Gain"
        min={0}
        max={20}
        step={0.1}
        value={$typographyLayerStore.gain}
        on:change={(e) => typographyLayerStore.setGain(e.detail.value)}
      />

      <Folder title="Text" expanded={false}>
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

      <Folder title="Fill & Stroke" expanded={false}>
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

      <Folder title="Glow & Shadow" expanded={false}>
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

      <Folder title="Blur" expanded={false}>
        <Slider
          value={$typographyStore.blurAmount}
          label="Blur Amount"
          min={0}
          max={50}
          step={1}
          on:change={(e) => typographyStore.setBlurAmount(e.detail.value)}
        />
      </Folder>

      <Folder title="Inner Glow" expanded={false}>
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

      <Folder title="Background" expanded={false}>
        <Color
          value={$typographyStore.backgroundColor}
          label="Background Color"
          on:change={(e) => typographyStore.setBackgroundColor(e.detail.value)}
        />
      </Folder>
    </Folder>
  </Folder>

  <Folder title="Simulation">
    <Checkbox
      label="Animating"
      value={$simulationStore.animating}
      on:change={(e) => simulationStore.setAnimating(e.detail.value)}
    />
    <Slider
      label="Time Scale"
      min={0.1}
      max={20}
      step={0.1}
      value={$simulationStore.timeScale}
      on:change={(e) => simulationStore.setSpeed(e.detail.value)}
    />
    <Checkbox
      label="Use advanceTime()"
      value={$simulationStore.useAdvanceTime}
      on:change={(e) => simulationStore.setUseAdvanceTime(e.detail.value)}
    />
  </Folder>

  <Folder title="UI">
    <List
      label="Color Mode"
      value={$uiStore.colorMode}
      options={colorModeOptions}
      on:change={(e) => uiStore.setColorMode(e.detail.value)}
    />
    <Checkbox
      label="Show Scale Visualization"
      value={$uiStore.showScaleVisualization}
      on:change={(e) => uiStore.setShowScaleVisualization(e.detail.value)}
    />
  </Folder>

  <Folder title="Actions" expanded={true}>
    <Button
      title="Pause"
      on:click={() =>
        simulationStore.update((a) => ({ ...a, animating: false }))}
    />
    <Button
      title="Resume"
      on:click={() =>
        simulationStore.update((a) => ({ ...a, animating: true }))}
    />
    <Button title="Reset to Defaults" on:click={resetAll} />
  </Folder>
</Pane>
