import type { Card } from '../types';

export const sortCards = <C extends Card>(
  cards: ArrayOfLength<6, C>
): ArrayOfLength<6, C> =>
  pipe(cards).chain((list) =>
    IList.sort(list, (a, b) =>
      a.number === b.number
        ? a.color === 'black'
          ? -1
          : +1
        : a.number - b.number
    )
  ).value;
