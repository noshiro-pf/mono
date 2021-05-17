import type { Hsl, Hsla } from '../../types';

export const hslToStr = ([h, s, l]: Hsl): string => `hsl(${h}, ${s}%, ${l}%)`;
export const hslaToStr = ([h, s, l, a]: Hsla): string =>
  `hsla(${h}, ${s}%, ${l}%, ${a})`;
