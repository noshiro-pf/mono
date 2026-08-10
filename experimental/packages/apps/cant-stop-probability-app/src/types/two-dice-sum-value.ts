import * as t from '@noshiro/io-ts';
import { type DiceValue } from './dice-value';

const twoDiceSumValueType = t.uintRange({
  defaultValue: 2,
  start: 2,
  end: 13,
});

export type TwoDiceSumValue = t.TypeOf<typeof twoDiceSumValueType>;

export const toTwoDiceSumValue = twoDiceSumValueType.cast;

export const isTwoDiceSumValue = twoDiceSumValueType.is;

export const addDiceValues = (a: DiceValue, b: DiceValue): TwoDiceSumValue =>
  toTwoDiceSumValue(a + b);
