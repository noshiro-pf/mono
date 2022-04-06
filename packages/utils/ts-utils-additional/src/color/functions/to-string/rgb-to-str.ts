import type { Rgb, Rgba } from '../../types';

export const rgbToStr = ([r, g, b]: Rgb): string => `rgb(${r}, ${g}, ${b})`;
export const rgbaToStr = ([r, g, b, a]: Rgba): string =>
  `rgba(${r}, ${g}, ${b}, ${a})`;
