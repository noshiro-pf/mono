import type { CustomColor } from '../constants';
import type { CardColor } from './card-color';
import type { CardNumber } from './card-number';
import type { VisibilityFromMe, VisibleTo } from './visible-to';

export type Card = Readonly<{
  color: CardColor;
  number: CardNumber;
}>;

export type CardWithVisibility = Card & Readonly<{ visibleTo: VisibleTo }>;

export type CardWithHandler = CardWithVisibility &
  Readonly<{ onClick: () => void }>;

export type CardWithDisplayValue = CardWithHandler &
  Readonly<{
    visibilityFromMe: VisibilityFromMe;
    isClickable: boolean;
    float: 'always' | 'never' | 'onHover';
    showOutline: 'always' | 'never' | 'onHover';
    outlineColor: CustomColor;
  }>;
