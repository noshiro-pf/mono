/* transformer-ignore append-as-const */
//
// Same reason as `hsl-to-str.mts`: `as const` would make the type the product
// of three 256-member `RgbValue` unions, which is TS2590 territory for no
// benefit — the declared return type is `string`.

import { type Rgb, type Rgba } from '../../types/index.mjs';

export const rgbToStr = ([r, g, b]: Rgb): string => `rgb(${r}, ${g}, ${b})`;

export const rgbaToStr = ([r, g, b, a]: Rgba): string =>
  `rgba(${r}, ${g}, ${b}, ${a})`;
