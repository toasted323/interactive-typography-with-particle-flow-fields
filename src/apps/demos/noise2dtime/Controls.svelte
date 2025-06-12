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
    fbmStore,
    turbulenceStore,
    frequencyStore,
    noiseTimeScaleStore,
  } from "./stores/noise.js";

  import { simulationStore } from "./stores/simulation.js";

  import { colorModeOptions, uiStore } from "./stores/ui.js";

  function resetAll() {
    // --- Noise ---
    noiseTypeStore.reset();
    perlinStore.reset();
    flowStore.reset();
    fbmStore.reset();
    turbulenceStore.reset();
    frequencyStore.reset();
    noiseTimeScaleStore.reset();

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
      value={$frequencyStore}
      on:change={(e) => frequencyStore.set(e.detail.value)}
    />
    <Slider
      label="Noise Time Scale"
      min={0.1}
      max={1000}
      step={0.1}
      value={$noiseTimeScaleStore}
      on:change={(e) => noiseTimeScaleStore.set(e.detail.value)}
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
