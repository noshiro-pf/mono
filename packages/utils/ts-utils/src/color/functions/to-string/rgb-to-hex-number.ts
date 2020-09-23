import { Rgb, Rgba } from '../../types';
import { hexStrToNumber } from './hex-str-to-number';

export const rgbToHexNumber = ([r, g, b]: Rgb): number =>
  hexStrToNumber(`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`);

export const rgbaToHexNumber = ([r, g, b, a]: Rgba): {
  hex: number;
  alpha: number;
} => ({
  hex: rgbToHexNumber([r, g, b]),
  alpha: a,
});
