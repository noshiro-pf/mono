import * as t from '@noshiro/io-ts';

const twoDiceSumValueType = t.uintRange({
  defaultValue: 2,
  start: 2,
  end: 13,
});

export type TwoDiceSumValue = t.TypeOf<typeof twoDiceSumValueType>;

export const isTwoDiceSumValue = twoDiceSumValueType.is;
