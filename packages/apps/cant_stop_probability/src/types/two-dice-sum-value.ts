import { Num } from '@noshiro/ts-utils';

export type TwoDiceSumValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const isTwoDiceSumValue = (value: number): value is TwoDiceSumValue =>
  Num.isUint32(value) && 2 <= value && value <= 12;
