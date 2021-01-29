import { Hsl, Hsla, Rgb, Rgba } from '../../types';
import { numberToRgbValue } from '../from-number';

const hue2rgb = (p: number, q: number, s: number): number => {
  let t = s;
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }

  if (t < 1 / 6) return p + (q - p) * (6 * t);
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

export const hslToRgb = ([h, s, l]: Hsl): Rgb => {
  const h01 = h / 360;
  const s01 = s / 100;
  const l01 = l / 100;

  if (s01 === 0) {
    // achromatic
    const l255 = numberToRgbValue(l01 * 255);
    return [l255, l255, l255];
  }

  const q = l01 < 0.5 ? l01 * (1 + s01) : l01 + s01 - l01 * s01;
  const p = 2 * l01 - q;
  const r = hue2rgb(p, q, h01 + 1 / 3);
  const g = hue2rgb(p, q, h01);
  const b = hue2rgb(p, q, h01 - 1 / 3);

  return [
    numberToRgbValue(r * 255),
    numberToRgbValue(g * 255),
    numberToRgbValue(b * 255),
  ];
};

export const hslaToRgba = ([h, s, l, a]: Hsla): Rgba => {
  const [r, g, b] = hslToRgb([h, s, l]);
  return [r, g, b, a];
};
