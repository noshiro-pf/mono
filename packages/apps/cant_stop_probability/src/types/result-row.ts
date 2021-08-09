import type { uint32 } from '@noshiro/ts-utils';
import type { Count } from './count';
import type { TwoDiceSumValue } from './two-dice-sum-value';

export type ResultRow = Readonly<{
  id: string;
  selected: readonly [TwoDiceSumValue, TwoDiceSumValue, TwoDiceSumValue];
  count: Count;
  countSum: uint32;
  probability: number;
  expected: uint32;
}>;
