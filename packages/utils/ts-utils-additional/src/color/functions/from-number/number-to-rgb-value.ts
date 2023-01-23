import { Num } from '@noshiro/ts-utils';
import { type RgbValue } from '../../types';

const clamp255 = Num.clamp(0, 255) as (x: number) => RgbValue;

export const numberToRgbValue = (x: number): RgbValue =>
  clamp255(Num.roundToInt(x));
