import { ISet } from 'ts-data-forge';
import {
  addDiceValues,
  type DiceValue,
  type TwoDiceSumValue,
} from '../types/index.mjs';

export const possibleTwoDiceSums = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue,
): ISet<TwoDiceSumValue> =>
  ISet.create([
    addDiceValues(a, b),
    addDiceValues(a, c),
    addDiceValues(a, d),
    addDiceValues(b, c),
    addDiceValues(b, d),
    addDiceValues(c, d),
  ]);
