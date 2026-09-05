/* transformer-ignore append-as-const */
//
// `as const` on these template literals makes their type the product of every
// member of `Hue` (360) and `Percent` (101 each), i.e. millions of string
// literals, and `tsc` gives up with TS2590. The declared return type is
// `string`, so the literal type would buy nothing anyway.

import { type Hsl, type Hsla } from '../../types/index.mjs';

export const hslToStr = ([h, s, l]: Hsl): string => `hsl(${h}, ${s}%, ${l}%)`;

export const hslaToStr = ([h, s, l, a]: Hsla): string =>
  `hsla(${h}, ${s}%, ${l}%, ${a})`;
