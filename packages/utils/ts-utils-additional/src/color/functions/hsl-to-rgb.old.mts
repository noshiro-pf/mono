import { type Hsl, type Hsla, type Rgb, type Rgba } from '../types/index.mjs';
import { numberToRgbValue } from './from-number/index.mjs';

/**
 * @description
 * convert hsl to rgb.
 * link: https://www.w3.org/TR/css-color-3/#hsl-color
 * @deprecated
 */
export const hslToRgb = ([h, s, l]: Hsl): Rgb => {
  const normH = h / 360;
  const normS = s / 100;
  const normL = l / 100;

  const m2 = normL < 0.5 ? normL * (normS + 1) : normL + normS - normL * normS;

  const m1 = normL * 2 - m2;
  const normR = hue2rgb(m1, m2, normH + 1 / 3);
  const normG = hue2rgb(m1, m2, normH);
  const normB = hue2rgb(m1, m2, normH - 1 / 3);

  const r = numberToRgbValue(normR * 255);
  const g = numberToRgbValue(normG * 255);
  const b = numberToRgbValue(normB * 255);

  return [r, g, b];
};

const hue2rgb = (m1: number, m2: number, normH: number): number => {
  if (normH * 6 < 1) {
    return m1 + (m2 - m1) * normH * 6;
  } else if (normH * 2 < 1) {
    return m2;
  } else if (normH * 3 < 2) {
    return m1 + (m2 - m1) * (2 / 3 - normH) * 6;
  } else {
    return m1;
  }
};

/**
 * @deprecated
 */
export const hslaToRgba = ([h, s, l, a]: Hsla): Rgba => {
  // eslint-disable-next-line deprecation/deprecation
  const [r, g, b] = hslToRgb([h, s, l]);

  return [r, g, b, a];
};
