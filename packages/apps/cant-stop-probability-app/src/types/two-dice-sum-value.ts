import * as t from '@noshiro/io-ts';

const twoDiceSumValueType = t.uintRange({
  defaultValue: 2,
  min: 2,
  max: 12,
});

export type TwoDiceSumValue = t.TypeOf<typeof twoDiceSumValueType>;

export const isTwoDiceSumValue = twoDiceSumValueType.is;
