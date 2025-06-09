import svelte from "rollup-plugin-svelte";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import css from "rollup-plugin-css-only";
import path from "path";

const production = !process.env.ROLLUP_WATCH;

const aliasEntries = [
  { find: "$lib", replacement: path.resolve(__dirname, "src/lib") },
  { find: "$apps", replacement: path.resolve(__dirname, "src/apps") },
];

const svelteOptions = {
  compilerOptions: {
    dev: !production,
  },
};

export default [
  {
    input: "src/apps/demos/noise2dtime/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "Noise2DTime",
      file: "public/demos/noise2dtime/bundle.js",
    },
    plugins: [
      alias({ entries: aliasEntries }),
      svelte(svelteOptions),
      css({ output: "bundle.css" }),
      nodeResolve({
        browser: true,
        dedupe: ["svelte"],
        exportConditions: ["svelte"],
      }),
      commonjs(),
      production && terser(),
    ],
  },
  {
    input: "src/apps/demos/typography-builder/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "TypographyBuilder",
      file: "public/demos/typography-builder/bundle.js",
    },
    plugins: [
      alias({ entries: aliasEntries }),
      svelte(svelteOptions),
      css({ output: "bundle.css" }),
      nodeResolve({
        browser: true,
        dedupe: ["svelte"],
        exportConditions: ["svelte"],
      }),
      commonjs(),
      production && terser(),
    ],
  },
  {
    input: "src/apps/demos/layer-stack/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "LayerStack",
      file: "public/demos/layer-stack/bundle.js",
    },
    plugins: [
      alias({ entries: aliasEntries }),
      nodeResolve({ browser: true }),
      commonjs(),
      production && terser(),
    ],
  },
];
