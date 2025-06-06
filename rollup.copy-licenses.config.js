import copy from "rollup-plugin-copy";

export default {
  input: "empty.js", // Required, but not used
  plugins: [
    copy({
      targets: [
        { src: "LICENSE", dest: "public" },
        { src: "LICENSE-CC-BY-4.0.txt", dest: "public" },
        { src: "LICENSE-CC-BY-NC-SA-4.0.txt", dest: "public" },
      ],
    }),
  ],
};
