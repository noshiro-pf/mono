import {
  NonNegativeFiniteNumber as NN,
  toNonNegativeFiniteNumber as toNN,
  toPositiveFiniteNumber as toP,
} from '@noshiro/ts-utils';
import { type Rgb } from '../../types/index.mjs';

/**
 * The relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white.
 *
 * @link https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
 */
export const relativeLuminance = ([r, g, b]: Rgb): NonNegativeFiniteNumber =>
  // 0.2126 * f(r / 255) + 0.7152 * f(g / 255) + 0.0722 * f(b / 255)
  NN.add(
    NN.mul(toP(0.2126), f(NN.div(toNN(r), toP(255)))),
    NN.add(
      NN.mul(toP(0.7152), f(NN.div(toNN(g), toP(255)))),
      NN.mul(toP(0.0722), f(NN.div(toNN(b), toP(255)))),
    ),
  );

const f = (v: NonNegativeFiniteNumber): NonNegativeFiniteNumber =>
  v <= 0.039_28
    ? NN.div(v, toP(12.92))
    : NN.pow(NN.div(NN.add(v, toP(0.055)), toP(1.055)), toP(2.4));
