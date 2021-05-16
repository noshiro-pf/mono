import type { ReadonlyArrayOfLength } from '@noshiro/ts-utils';
import { pipe, sort } from '@noshiro/ts-utils';
import type { Card } from '../types';

export const sortCards = <C extends Card>(
  cards: ReadonlyArrayOfLength<6, C>
): ReadonlyArrayOfLength<6, C> =>
  pipe(cards).chain(
    sort<C>((a, b) =>
      a.number === b.number
        ? a.color === 'black'
          ? -1
          : +1
        : a.number - b.number
    )
  ).value;
