import { TinyColor } from '@ctrl/tinycolor';
import {
  Hsl,
  Hsla,
  numberToHue,
  numberToPercent,
  Rgb,
  Rgba,
} from 'noshiro-ts-utils';

export const rgbToHsl = ([r, g, b]: Rgb): Hsl => {
  const tc = new TinyColor({ r, g, b });
  const { h, s, l } = tc.toHsl();
  return [numberToHue(h), numberToPercent(100 * s), numberToPercent(100 * l)];
};

export const rgbaToHsla = ([r, g, b, a]: Rgba): Hsla => {
  const [h, s, l] = rgbToHsl([r, g, b]);
  return [h, s, l, a];
};
