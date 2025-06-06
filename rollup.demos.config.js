import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import copy from "rollup-plugin-copy";
import path from "path";

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: "src-demos/noise2dtime/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "Noise2DTime",
      file: "dist/demos/noise2dtime/bundle.js",
    },
    plugins: [
      alias({
        entries: [
          { find: "$core", replacement: path.resolve(__dirname, "src") },
        ],
      }),
      nodeResolve({ browser: true }),
      commonjs(),
      production && terser(),
      copy({
        targets: [
          { src: "public/demos/noise2dtime/**/*", dest: "dist/demos/noise2dtime" }
        ],
        verbose: true,
      }),
    ],
  },
  {
    input: "src-demos/typography-builder/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "TypographyBuilder",
      file: "dist/demos/typography-builder/bundle.js",
    },
    plugins: [
      alias({
        entries: [
          { find: "$core", replacement: path.resolve(__dirname, "src") },
        ],
      }),
      nodeResolve({ browser: true }),
      commonjs(),
      production && terser(),
      copy({
        targets: [
          { src: "public/demos/typography-builder/**/*", dest: "dist/demos/typography-builder" }
        ],
        verbose: true,
      }),
    ],
  },
  {
    input: "src-demos/layer-stack/main.js",
    output: {
      sourcemap: true,
      format: "iife",
      name: "LayerStack",
      file: "dist/demos/layer-stack/bundle.js",
    },
    plugins: [
      alias({
        entries: [
          { find: "$core", replacement: path.resolve(__dirname, "src") },
        ],
      }),
      nodeResolve({ browser: true }),
      commonjs(),
      production && terser(),
      copy({
        targets: [
          { src: "public/demos/layer-stack/**/*", dest: "dist/demos/layer-stack" }
        ],
        verbose: true,
      }),
    ],
  }
];
