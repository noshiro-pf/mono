import * as t from '@noshiro/io-ts';

export const visibleToTypeDef = t.enumType(['self', 'everyone', 'pair']);

export type VisibleTo = t.TypeOf<typeof visibleToTypeDef>;

export type VisibilityFromMe =
  | 'faceDown'
  | 'faceDownButVisibleToCounter'
  | 'faceDownButVisibleToMe'
  | 'faceUp';
