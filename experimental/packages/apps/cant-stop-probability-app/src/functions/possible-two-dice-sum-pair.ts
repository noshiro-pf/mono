import { addDiceValues, type DiceValue, type TwoDiceSumValue } from '../types';

export const possibleTwoDiceSumPairs = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue,
): ArrayOfLength<3, readonly [TwoDiceSumValue, TwoDiceSumValue]> =>
  [
    [addDiceValues(a, b), addDiceValues(c, d)],
    [addDiceValues(a, c), addDiceValues(b, d)],
    [addDiceValues(a, d), addDiceValues(b, c)],
  ] as const;
