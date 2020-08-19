import { clamp, roundToInt } from '../../../num';
import { Percent } from '../../../types';

const clamp100 = clamp(0, 100) as (x: number) => Percent;

export const numberToPercent = (x: number): Percent => clamp100(roundToInt(x));
