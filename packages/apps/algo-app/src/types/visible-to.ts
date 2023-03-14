import * as t from '@noshiro/io-ts';

export const visibleToTypeDef = t.enumType({
  values: ['everyone', 'pair', 'self'] as const,
  defaultValue: 'self',
});

export type VisibleTo = t.TypeOf<typeof visibleToTypeDef>;

export type VisibilityFromMe =
  | 'faceDown'
  | 'faceDownButVisibleToCounter'
  | 'faceDownButVisibleToMe'
  | 'faceUp';
