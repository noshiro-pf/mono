import { assertType, pipe, sort, TypeExtends } from '@noshiro/ts-utils';
import { Card } from '../types/card-type';
import { Player6Cards } from '../types/player-6-card';

export const sortCards = (cards: Player6Cards): Player6Cards =>
  pipe(cards).chain(
    sort<Card>((a, b) =>
      a.number === b.number
        ? a.color === 'black'
          ? -1
          : +1
        : a.number - b.number
    )
  ).value;

assertType<TypeExtends<Player6Cards, readonly Card[]>>();
