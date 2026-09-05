import { type FixedLengthTuple } from 'ts-type-forge';
import { type Alpha } from './alpha.mjs';
import { type RgbValue as RgbV } from './rgb-value.mjs';

export type Rgb = FixedLengthTuple<3, RgbV>;

export const rgb = (r: RgbV, g: RgbV, b: RgbV): Rgb => [r, g, b] as const;

export type Rgba = readonly [Rgb[0], Rgb[1], Rgb[2], Alpha];

export const rgba = (r: RgbV, g: RgbV, b: RgbV, a: Alpha): Rgba =>
  [r, g, b, a] as const;
