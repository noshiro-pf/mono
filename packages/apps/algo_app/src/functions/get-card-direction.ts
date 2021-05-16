import type { ReadonlyArrayOfLength, ReadonlyRecord } from '@noshiro/ts-utils';
import type { Card, Direction } from '../types';
import { cardEq } from './card-eq';

export const getCardDirection = (
  playerCards: ReadonlyRecord<Direction, ReadonlyArrayOfLength<6, Card>>,
  target: Card
): Direction =>
  playerCards.W.find((c) => cardEq(c, target)) !== undefined
    ? 'W'
    : playerCards.E.find((c) => cardEq(c, target)) !== undefined
    ? 'E'
    : playerCards.N.find((c) => cardEq(c, target)) !== undefined
    ? 'N'
    : 'S';
