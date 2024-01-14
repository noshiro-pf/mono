import { Num, Uint8 } from '@noshiro/ts-utils';
import { type RgbValue } from '../../types/index.mjs';

export const numberToRgbValue = (x: number): RgbValue =>
  Uint8.clamp(Num.roundToInt(x));
