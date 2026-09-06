import { type FixedLengthTuple, type ReadonlyRecord } from 'ts-type-forge';
import { type Card, type NWES } from '../types/index.mjs';
import { cardEq } from './card-eq.mjs';

export const getCardDirection = (
  playerCards: ReadonlyRecord<NWES, FixedLengthTuple<6, Card>>,
  target: Card,
): NWES =>
  playerCards.W.some((c) => cardEq(c, target))
    ? 'W'
    : playerCards.E.some((c) => cardEq(c, target))
      ? 'E'
      : playerCards.N.some((c) => cardEq(c, target))
        ? 'N'
        : 'S';
