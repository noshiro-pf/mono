import { clamp, roundToInt } from '../../../num';
import type { RgbValue } from '../../types';

const clamp255 = clamp(0, 255) as (x: number) => RgbValue;

export const numberToRgbValue = (x: number): RgbValue =>
  clamp255(roundToInt(x));
