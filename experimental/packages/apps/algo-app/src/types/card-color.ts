import * as t from '@noshiro/io-ts';

export const cardColorTypeDef = t.enumType(['black', 'white'], {
  defaultValue: 'black',
  typeName: 'CardColor',
});

export type CardColor = t.TypeOf<typeof cardColorTypeDef>;

export const isCardColor = cardColorTypeDef.is;
