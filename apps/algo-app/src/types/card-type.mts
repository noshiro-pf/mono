import * as t from 'ts-fortress';
import type { MergeIntersection } from 'ts-type-forge';
import type { CustomColor } from '../constants/index.mjs';
import { cardColorTypeDef } from './card-color.mjs';
import { cardNumberTypeDef } from './card-number.mjs';
import type { VisibilityFromMe, VisibleTo } from './visible-to.mjs';

const def = {
  color: cardColorTypeDef,
  number: cardNumberTypeDef,
} as const;

export const cardTypeDef = t.record(def, { typeName: 'Card' });

export type Card = t.TypeOf<typeof cardTypeDef>;

export const isCard = cardTypeDef.is;

export type CardWithVisibility = MergeIntersection<
  Card & Readonly<{ visibleTo: VisibleTo }>
>;

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
