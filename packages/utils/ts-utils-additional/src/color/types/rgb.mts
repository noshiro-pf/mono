import { type Alpha } from './alpha.mjs';
import { type RgbValue as RgbV } from './rgb-value.mjs';

export type Rgb = readonly [RgbV, RgbV, RgbV];
export const rgb = (r: RgbV, g: RgbV, b: RgbV): Rgb => [r, g, b];
export type Rgba = readonly [Rgb[0], Rgb[1], Rgb[2], Alpha];
export const rgba = (r: RgbV, g: RgbV, b: RgbV, a: Alpha): Rgba => [r, g, b, a];
