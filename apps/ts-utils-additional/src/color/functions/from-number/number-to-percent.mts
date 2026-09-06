import { Num } from 'ts-data-forge';
import { type Percent } from 'ts-type-forge';

const clamp = Num.clamp(0, 100);

export const numberToPercent = (x: number): Percent =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  clamp(Num.roundToInt(x)) as Percent;
