import { type TypeOf, uintRange } from 'ts-fortress';
import { type DiceValue } from './dice-value.mjs';

const twoDiceSumValueType = uintRange(2, 13, { defaultValue: 2 });

export type TwoDiceSumValue = TypeOf<typeof twoDiceSumValueType>;

export const toTwoDiceSumValue = twoDiceSumValueType.cast;

export const isTwoDiceSumValue = twoDiceSumValueType.is;

export const addDiceValues = (a: DiceValue, b: DiceValue): TwoDiceSumValue =>
  toTwoDiceSumValue(a + b);
