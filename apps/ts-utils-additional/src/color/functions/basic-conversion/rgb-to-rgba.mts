import type { Alpha, Rgb, Rgba } from '../../types/index.mjs';

export const rgbToRgba = ([r, g, b]: Rgb, a: Alpha = 1): Rgba =>
  [r, g, b, a] as const;
