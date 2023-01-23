import { type Percent as P } from '../../types';
import { type Alpha } from './alpha';
import { type Hue } from './hue';

export type Hsl = readonly [Hue, P, P];
export const hsl = (h: Hue, s: P, l: P): Hsl => [h, s, l];
export type Hsla = readonly [Hsl[0], Hsl[1], Hsl[2], Alpha];
export const hsla = (h: Hue, s: P, l: P, a: Alpha): Hsla => [h, s, l, a];
