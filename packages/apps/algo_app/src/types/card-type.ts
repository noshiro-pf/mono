import type { CustomColor } from '../constants';
import type { CardColor } from './card-color';
import { isCardColor } from './card-color';
import type { CardNumber } from './card-number';
import { isCardNumber } from './card-number';
import type { VisibilityFromMe, VisibleTo } from './visible-to';

export type Card = Readonly<{
  color: CardColor;
  number: CardNumber;
}>;

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

export const isCard = (data: unknown): data is Card =>
  isNonNullObject(data) &&
  hasKeyValue(data, 'color', isCardColor) &&
  hasKeyValue(data, 'number', isCardNumber);
