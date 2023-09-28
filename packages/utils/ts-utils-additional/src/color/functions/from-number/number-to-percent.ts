import { Num } from '@noshiro/ts-utils';

// eslint-disable-next-line no-restricted-syntax
const clamp100 = Num.clamp<number>(0, 100) as (x: number) => Percent;

export const numberToPercent = (x: number): Percent =>
  clamp100(Num.roundToInt(x));
