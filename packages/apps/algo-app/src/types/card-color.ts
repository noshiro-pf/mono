import * as t from '@noshiro/io-ts';

export const cardColorTypeDef = t.enumType({
  values: ['black', 'white'] as const,
  defaultValue: 'black',
  typeName: 'CardColor',
});

export type CardColor = t.TypeOf<typeof cardColorTypeDef>;

export const isCardColor = cardColorTypeDef.is;
