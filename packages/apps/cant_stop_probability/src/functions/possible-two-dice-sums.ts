import type { DiceValue, TwoDiceSumValue } from '../types';

export const possibleTwoDiceSums = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue
): Set<TwoDiceSumValue> =>
  new Set([a + b, a + c, a + d, b + c, b + d, c + d] as TwoDiceSumValue[]);
