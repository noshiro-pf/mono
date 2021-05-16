import type { Rect } from '@noshiro/ts-utils';
import type { Card } from '../card-type';
import type { Direction } from '../direction';

export type DecidedAnswerBalloonProps = Readonly<{
  anchorCardRect: Rect;
  arrowDirection: Direction;
  card: Card;
  showSymbol: 'o' | 'x' | undefined;
}>;
