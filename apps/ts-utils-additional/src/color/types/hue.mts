import { Num } from 'ts-data-forge';
import { type UintRange } from 'ts-type-forge';
import { toHue } from '../to-hue.mjs';

export type Hue = UintRange<0, 360>;

export const hue = (h: number): Hue => toHue(Math.round(Num.clamp(0, 359)(h)));
