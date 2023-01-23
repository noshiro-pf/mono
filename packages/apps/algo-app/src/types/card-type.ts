import { type CustomColor } from '../constants';
import { isCardColor, type CardColor } from './card-color';
import { isCardNumber, type CardNumber } from './card-number';
import { type VisibilityFromMe, type VisibleTo } from './visible-to';

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
  isRecord(data) &&
  Obj.hasKeyValue(data, 'color', isCardColor) &&
  Obj.hasKeyValue(data, 'number', isCardNumber);
