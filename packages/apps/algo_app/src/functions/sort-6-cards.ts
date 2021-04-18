import { assertType, TypeExtends } from '@noshiro/ts-utils';
import { Card } from '../types/card-type';
import { Player6Cards } from '../types/player-6-card';

export const sortCards = (cards: Player6Cards): Player6Cards =>
  (cards
    .slice()
    .sort((a, b) =>
      a.number === b.number
        ? a.color === 'black'
          ? -1
          : +1
        : a.number - b.number
    ) as unknown) as Player6Cards;

assertType<TypeExtends<Player6Cards, readonly Card[]>>();
