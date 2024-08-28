import * as t from '@noshiro/io-ts';
import { type CustomColor } from '../constants';
import { cardColorTypeDef } from './card-color';
import { cardNumberTypeDef } from './card-number';
import { visibleToTypeDef, type VisibilityFromMe } from './visible-to';

const def = {
  color: cardColorTypeDef,
  number: cardNumberTypeDef,
} as const;

export const cardTypeDef = t.record(def, { typeName: 'Card' });

export const cardWithVisibilityTypeDef = t.record(
  {
    ...def,
    visibleTo: visibleToTypeDef,
  },
  {
    typeName: 'Card',
  },
);

export type Card = t.TypeOf<typeof cardTypeDef>;

export const isCard = cardTypeDef.is;

export type CardWithVisibility = t.TypeOf<typeof cardWithVisibilityTypeDef>;

export type CardWithHandler = MergeIntersection<
  CardWithVisibility & Readonly<{ onClick: () => void }>
>;
export type CardWithDisplayValue = MergeIntersection<
  CardWithHandler &
    Readonly<{
      visibilityFromMe: VisibilityFromMe;
      isClickable: boolean;
      float: 'always' | 'never' | 'onHover';
      showOutline: 'always' | 'never' | 'onHover';
      outlineColor: CustomColor;
    }>
>;
