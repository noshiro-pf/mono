import { type FixedLengthTuple } from 'ts-type-forge';
import {
  addDiceValues,
  type DiceValue,
  type TwoDiceSumValue,
} from '../types/index.mjs';

export const possibleTwoDiceSumPairs = (
  a: DiceValue,
  b: DiceValue,
  c: DiceValue,
  d: DiceValue,
): FixedLengthTuple<3, FixedLengthTuple<2, TwoDiceSumValue>> =>
  [
    [addDiceValues(a, b), addDiceValues(c, d)],
    [addDiceValues(a, c), addDiceValues(b, d)],
    [addDiceValues(a, d), addDiceValues(b, c)],
  ] as const;
