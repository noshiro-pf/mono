import type { ArrayOfLength } from '@noshiro/ts-utils';
import type { DiceValue } from '../types/dice-value';
import type { TwoDiceSumValue } from '../types/two-dice-sum-value';

export const possibleTwoDiceSumPairs = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue
): ArrayOfLength<3, [TwoDiceSumValue, TwoDiceSumValue]> =>
  [
    [a + b, c + d],
    [a + c, b + d],
    [a + d, b + c],
  ] as ArrayOfLength<3, [TwoDiceSumValue, TwoDiceSumValue]>;
