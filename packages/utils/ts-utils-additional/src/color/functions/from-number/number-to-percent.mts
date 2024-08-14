import { Num } from '@noshiro/ts-utils';

const clamp = Num.clamp<number>(0, 100);

export const numberToPercent = (x: number): Percent =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  clamp(Num.roundToInt(x)) as Percent;
