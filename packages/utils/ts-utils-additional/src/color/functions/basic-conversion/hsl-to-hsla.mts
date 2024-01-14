import { type Alpha, type Hsl, type Hsla } from '../../types/index.mjs';

export const hslToHsla = ([h, s, l]: Hsl, a: Alpha = 1): Hsla => [h, s, l, a];
