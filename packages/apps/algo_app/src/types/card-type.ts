import { CardColor } from './card-color';
import { CardNumber } from './card-number';

export type Card = Readonly<{
  color: CardColor;
  number: CardNumber;
  faceUp: boolean;
  visibleToPair: boolean;
}>;

export type CardsWithDisplayValue = Card &
  Readonly<{
    visibleToMe: boolean;
    visibleToCounter: boolean;
  }>;
