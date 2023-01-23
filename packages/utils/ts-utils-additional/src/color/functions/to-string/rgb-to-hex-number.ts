import { type Rgb, type Rgba } from '../../types';
import { hexStrToNumber } from './hex-str-to-number';

export const rgbToHexNumber = ([r, g, b]: Rgb): number =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  hexStrToNumber(`#${r.toString(16)}${g.toString(16)}${b.toString(16)}`)!;

export const rgbaToHexNumber = ([r, g, b, a]: Rgba): Readonly<{
  hex: number;
  alpha: number;
}> => ({
  hex: rgbToHexNumber([r, g, b]),
  alpha: a,
});
