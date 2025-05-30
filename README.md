# Interactive Typography with Particle Flow Fields

Interactive typography experiment with procedural flow fields and particles.
Inspired by an original AS3 implementation, reimagined in JavaScript.

---

## Table of Contents

- [Live Demos](#live-demos)
- [File Structure](#file-structure)
- [Noise Implementations & Attribution](#noise-implementations--attribution)
- [Licensing](#licensing)
- [Attribution](#attribution)
- [References](#references)
- [Contact](#contact)

---

## Live Demos


These live demos are both interactive showcases and also serve as visual testing environments.

- [Noise2DTime Demo](https://toasted323.github.io/interactive-typography-with-particle-flow-fields/demos/noise2dtime/)
- [TypographyBuilder Demo](https://toasted323.github.io/interactive-typography-with-particle-flow-fields/demos/typography-builder/)

---

## File Structure

```
.
├── demos/ # Visual testing, tweaking, experimentation
├── public/ # Final public visualization, presets and interactive animations
├── scripts/ # Utility scripts for development
├── src/ # Core source code and utilities
├── tests/ # Manual tests for numerical accuracy and statistics
├── LICENSE # MIT License for all source code
├── LICENSE-CC-BY-4.0.txt # CC BY 4.0 license for demo visuals and presets
├── LICENSE-CC-BY-NC-SA-4.0.txt # CC BY-NC-SA 4.0 license for main visuals and presets
└── README.md # Project documentation
```

---

## Noise Implementations & Attribution

This repository includes several procedural noise implementations, each with academic and open-source origins:

- **Flow Noise**: Based on Perlin & Neyret (2001).
- **Improved Perlin Noise**: Based on Ken Perlin’s improved algorithm (2002) and open-source implementations by Stefan Gustavson and others.
- **Curl Noise**: Based on Robert Bridson’s “Curl-Noise for Procedural Fluid Flow” ([SIGGRAPH 2007](https://www.cs.ubc.ca/~rbridson/docs/bridson-siggraph2007-curlnoise.pdf)).

See the source files and comments for detailed attribution.

---

## Licensing

- **All Source Code**:
  Licensed under the [MIT License](./LICENSE).
  You are free to use, modify, and distribute the source code with attribution.

- **Demo Visuals and Presets (`demos/`)**:
  Licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](./LICENSE-CC-BY-4.0.txt).
  You may use, share, and remix demo visuals and parameter presets with attribution.

- **Main Visuals and Presets (`public/`)**:
  Licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](./LICENSE-CC-BY-NC-SA-4.0.txt).
  Non-commercial use only; derivatives must use the same license; attribution required.

> **Note:**
> See the respective license files for full terms.

---

## Attribution

Unless otherwise noted, all creative works produced by this project are attributed as follows:

- **`demos/` folder:**
  All visuals, interactive animations, and parameter presets are © 2025 [github.com/toasted323](https://github.com/toasted323), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

- **`public/` folder:**
  All visuals, interactive animations, and parameter presets are © 2025 [github.com/toasted323](https://github.com/toasted323), licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).


---

## References

- Perlin, K. "An Image Synthesizer", SIGGRAPH, 1985.
- Perlin, K., & Neyret, F. "Flow Noise", 2001.
- Perlin, K. “Improving Noise”, ACM Transactions on Graphics (TOG), Vol. 21, No. 3, July 2002, pp. 681–682.
- Bridson, R., Hourihan, J., & Nordenstam, M. "Curl-Noise for Procedural Fluid Flow", SIGGRAPH 2007.
- [Stefan Gustavson, "perlin-noise" reference implementations](https://github.com/stegu/perlin-noise)
- [josephg's noisejs repository](https://github.com/josephg/noisejs/blob/master/perlin.js)

---

## Contact

Copyright (c) 2025 [github.com/toasted323](https://github.com/toasted323)
