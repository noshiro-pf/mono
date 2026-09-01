import * as t from 'ts-fortress';

export const visibleToTypeDef = t.enumType(['self', 'everyone', 'pair']);

export type VisibleTo = t.TypeOf<typeof visibleToTypeDef>;

export type VisibilityFromMe =
  | 'faceDown'
  | 'faceDownButVisibleToCounter'
  | 'faceDownButVisibleToMe'
  | 'faceUp';
