import type { DiceValue, TwoDiceSumValue } from '../types';

export const possibleTwoDiceSums = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue
): ISet<TwoDiceSumValue> =>
  ISet.new([a + b, a + c, a + d, b + c, b + d, c + d] as TwoDiceSumValue[]);
