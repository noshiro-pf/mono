import type { Card, NWES } from '../types';
import { cardEq } from './card-eq';

export const getCardDirection = (
  playerCards: ReadonlyRecord<NWES, ArrayOfLength<6, Card>>,
  target: Card
): NWES =>
  playerCards.W.some((c) => cardEq(c, target))
    ? 'W'
    : playerCards.E.some((c) => cardEq(c, target))
    ? 'E'
    : playerCards.N.some((c) => cardEq(c, target))
    ? 'N'
    : 'S';
