import { type DiceValue, type TwoDiceSumValue } from '../types';

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
