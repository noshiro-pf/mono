import { uint32 } from '@noshiro/ts-utils';
import { Count } from './count';
import { TwoDiceSumValue } from './two-dice-sum-value';

export type ResultRow = Readonly<{
  selected: readonly [TwoDiceSumValue, TwoDiceSumValue, TwoDiceSumValue];
  count: Count;
  countSum: uint32;
  probability: number;
  expected: uint32;
}>;
