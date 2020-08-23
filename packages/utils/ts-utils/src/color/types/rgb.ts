import { Alpha } from './alpha';
import { RgbValue as RgbV } from './rgb-value';

export type Rgb = [RgbV, RgbV, RgbV];
export const rgb = (r: RgbV, g: RgbV, b: RgbV): Rgb => [r, g, b];
export type Rgba = [Rgb[0], Rgb[1], Rgb[2], Alpha];
export const rgba = (r: RgbV, g: RgbV, b: RgbV, a: Alpha): Rgba => [r, g, b, a];
