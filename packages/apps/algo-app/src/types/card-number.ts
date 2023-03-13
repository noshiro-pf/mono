import * as t from '@noshiro/io-ts';

export const cardNumberTypeDef = t.uintRange({
  min: 0,
  max: 11,
  defaultValue: 0,
  typeName: 'CardNumber',
});

export type CardNumber = t.TypeOf<typeof cardNumberTypeDef>;

export const isCardNumber = cardNumberTypeDef.is;
