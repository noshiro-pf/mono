import type { Count } from './count';
import type { TwoDiceSumValue } from './two-dice-sum-value';

export type ResultRow = Readonly<{
  id: string;
  selected: readonly [TwoDiceSumValue, TwoDiceSumValue, TwoDiceSumValue];
  count: Count;
  countSum: number;
  probability: number;
  expected: number;
}>;
