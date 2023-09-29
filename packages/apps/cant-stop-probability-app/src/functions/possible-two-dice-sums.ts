import { addDiceValues, type DiceValue, type TwoDiceSumValue } from '../types';

export const possibleTwoDiceSums = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue
): ISet<TwoDiceSumValue> =>
  ISet.new([
    addDiceValues(a, b),
    addDiceValues(a, c),
    addDiceValues(a, d),
    addDiceValues(b, c),
    addDiceValues(b, d),
    addDiceValues(c, d),
  ]);
