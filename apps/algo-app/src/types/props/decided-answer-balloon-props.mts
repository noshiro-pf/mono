import { type Rect } from 'ts-utils-additional';
import { type Card } from '../card-type.mjs';
import { type NWES } from '../direction.mjs';

export type DecidedAnswerBalloonProps = Readonly<{
  anchorCardRect: Rect;
  arrowDirection: NWES;
  card: Card;
  showSymbol: 'o' | 'x' | undefined;
}>;
