import type { ReadonlyRecord } from '@noshiro/ts-utils';
import type { Card, NWES } from '../types';
import { cardEq } from './card-eq';

export const getCardDirection = (
  playerCards: ReadonlyRecord<NWES, ReadonlyArrayOfLength<6, Card>>,
  target: Card
): NWES =>
  playerCards.W.find((c) => cardEq(c, target)) !== undefined
    ? 'W'
    : playerCards.E.find((c) => cardEq(c, target)) !== undefined
    ? 'E'
    : playerCards.N.find((c) => cardEq(c, target)) !== undefined
    ? 'N'
    : 'S';
