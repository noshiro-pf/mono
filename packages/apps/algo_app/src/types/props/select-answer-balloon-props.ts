import type { Rect } from '@noshiro/ts-utils';
import type { CardColor } from '../card-color';
import type { CardNumber } from '../card-number';
import type { Direction } from '../direction';

export type SelectAnswerBalloonProps = Readonly<{
  anchorCardRect: Rect;
  arrowDirection: Direction;
  cardColor: CardColor;
  selectedNumber: CardNumber | undefined;
  onSelectedNumberChange: (cardNumber: CardNumber) => void;
  onCancelClick: () => void;
  submitAnswer: () => void;
  submitButtonIsDisabled: boolean;
}>;
