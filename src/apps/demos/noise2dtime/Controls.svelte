<script>
  import {
    Pane,
    Folder,
    Slider,
    List,
    Checkbox,
    Button,
  } from "svelte-tweakpane-ui";

  import {
    noiseTypeStore,
    noiseTypeOptions,
    perlinStore,
    flowStore,
    frequencyStore,
    noiseSpeedStore,
  } from "./stores/noise.js";

  import { simulationStore } from "./stores/simulation.js";

  import { colorModeOptions, uiStore } from "./stores/ui.js";

  function resetAll() {
    // --- Noise ---
    noiseTypeStore.reset();
    perlinStore.reset();
    turbulenceStore.reset();
    frequencyStore.reset();
    noiseSpeedStore.reset();

    // --- Simulation ---
    simulationStore.reset();

    // --- UI ---
    uiStore.reset();
  }
</script>

<Pane>
  <Folder title="Noise">
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

    <Slider
      label="Frequency"
      min={0.001}
      max={1}
      step={0.001}
      value={$frequencyStore}
      on:change={(e) => frequencyStore.set(e.detail.value)}
    />
    <Slider
      label="Noise Speed"
      min={0.1}
      max={1000}
      step={0.1}
      value={$noiseSpeedStore}
      on:change={(e) => noiseSpeedStore.set(e.detail.value)}
    />
  </Folder>

  <Folder title="Simulation">
    <Checkbox
      label="Animating"
      value={$simulationStore.animating}
      on:change={(e) => simulationStore.setAnimating(e.detail.value)}
    />
    <Slider
      label="Speed"
      min={0.1}
      max={20}
      step={0.1}
      value={$simulationStore.speed}
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
      bind:value={$uiStore.colorMode}
      options={colorModeOptions}
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
