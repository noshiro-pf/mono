import {
  FiniteNumber,
  Num,
  toFiniteNumber,
  toPositiveFiniteNumber,
} from '@noshiro/ts-utils';
import {
  type Hsl,
  type Hsla,
  type Rgb,
  type Rgba,
} from '../../types/index.mjs';
import { numberToHue, numberToPercent } from '../from-number/index.mjs';

export const rgbToHsl = ([r, g, b]: Rgb): Hsl => {
  const [r01, g01, b01] = [
    toFiniteNumber(r / 255),
    toFiniteNumber(g / 255),
    toFiniteNumber(b / 255),
  ];

  /** `0 <= max <= 1` */
  const max = Math.max(r01, g01, b01);

  /** `0 <= min <= 1` */
  const min = Math.min(r01, g01, b01);

  /** `0 <= l <= 1` */
  const l = (max + min) / 2;

  if (max === min) {
    // achromatic
    return [0, 0, numberToPercent(100 * l)];
  }

  /** `0 < d <= 1` */
  const d = toPositiveFiniteNumber(max - min);

  const h =
    (() => {
      switch (max) {
        case r01:
          return Num.div(FiniteNumber.sub(g01, b01), d) + (g01 < b01 ? 6 : 0);
        case g01:
          return Num.div(FiniteNumber.sub(b01, r01), d) + 2;
        case b01:
          return Num.div(FiniteNumber.sub(r01, g01), d) + 4;
        default:
          return 0;
      }
    })() / 6;

  return [
    numberToHue(h * 360),
    numberToPercent(
      100 *
        (l > 0.5
          ? Num.div(d, toPositiveFiniteNumber(2 - max - min))
          : Num.div(d, toPositiveFiniteNumber(max + min))),
    ),
    numberToPercent(100 * l),
  ];
};

export const rgbaToHsla = ([r, g, b, a]: Rgba): Hsla => {
  const [h, s, l] = rgbToHsl([r, g, b]);

  return [h, s, l, a];
};
