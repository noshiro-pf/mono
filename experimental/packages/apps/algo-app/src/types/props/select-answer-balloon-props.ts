import { type Rect } from '@noshiro/ts-utils-additional';
import { type CardColor } from '../card-color';
import { type CardNumber } from '../card-number';
import { type NWES } from '../direction';

export type SelectAnswerBalloonProps = Readonly<{
  anchorCardRect: Rect;
  arrowDirection: NWES;
  cardColor: CardColor;
  selectedNumber: CardNumber | undefined;
  onSelectedNumberChange: (cardNumber: CardNumber) => void;
  onCancelClick: () => void;
  submitAnswer: () => void;
  submitButtonIsDisabled: boolean;
}>;
