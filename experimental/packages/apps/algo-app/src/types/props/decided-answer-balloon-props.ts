import { type Rect } from '@noshiro/ts-utils-additional';
import { type Card } from '../card-type';
import { type NWES } from '../direction';

export type DecidedAnswerBalloonProps = Readonly<{
  anchorCardRect: Rect;
  arrowDirection: NWES;
  card: Card;
  showSymbol: 'o' | 'x' | undefined;
}>;
