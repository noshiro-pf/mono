import * as t from 'ts-fortress';
import { type DiceValue } from './dice-value.mjs';

const twoDiceSumValueType = t.uintRangeInclusive(2, 12, { defaultValue: 2 });

export type TwoDiceSumValue = t.TypeOf<typeof twoDiceSumValueType>;

export const asTwoDiceSumValue = twoDiceSumValueType.cast;

export const isTwoDiceSumValue = twoDiceSumValueType.is;

export const addDiceValues = (a: DiceValue, b: DiceValue): TwoDiceSumValue =>
  asTwoDiceSumValue(a + b);
