import { type Rect } from 'ts-utils-additional';
import { type CardColor } from '../card-color.mjs';
import { type CardNumber } from '../card-number.mjs';
import { type NWES } from '../direction.mjs';

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
