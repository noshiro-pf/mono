import * as t from '@noshiro/io-ts';

export const cardNumberTypeDef = t.uintRange({
  start: 0,
  end: 12,
  defaultValue: 0,
  typeName: 'CardNumber',
});

export type CardNumber = t.TypeOf<typeof cardNumberTypeDef>;

export const isCardNumber = cardNumberTypeDef.is;
