import { type SafeUint } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { type Count } from './count.mjs';
import { type TwoDiceSumValue } from './two-dice-sum-value.mjs';

export type ResultRow = Readonly<{
  id: string;
  selected: FixedLengthTuple<3, TwoDiceSumValue>;
  count: Count;
  countSum: SafeUint;
  probability: number;
  expected: number;
}>;
