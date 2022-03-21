import type { Rgb } from '../../types';

export const rgbToHex = ([r, g, b]: Rgb): string => {
  const r16 = r.toString(16).padStart(2, '0');
  const g16 = g.toString(16).padStart(2, '0');
  const b16 = b.toString(16).padStart(2, '0');

  return `#${r16}${g16}${b16}`;
};
