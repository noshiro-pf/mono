import { TinyColor } from '@ctrl/tinycolor';
import { Hsl, Hsla, numberToRgbValue, Rgb, Rgba } from '@mono/ts-utils';

export const hslToRgb = ([h, s, l]: Hsl): Rgb => {
  const tc = new TinyColor({ h, s, l });
  const { r, g, b } = tc.toRgb();
  return [numberToRgbValue(r), numberToRgbValue(g), numberToRgbValue(b)];
};

export const hslaToRgba = ([h, s, l, a]: Hsla): Rgba => {
  const [r, g, b] = hslToRgb([h, s, l]);
  return [r, g, b, a];
};
