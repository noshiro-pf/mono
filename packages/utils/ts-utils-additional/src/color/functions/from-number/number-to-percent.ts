import { Num } from '@noshiro/ts-utils';
import type { Percent } from '../../../types';

const clamp100 = Num.clamp(0, 100) as (x: number) => Percent;

export const numberToPercent = (x: number): Percent =>
  clamp100(Num.roundToInt(x));
