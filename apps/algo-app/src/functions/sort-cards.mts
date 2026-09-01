import { Arr } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { type Card } from '../types/index.mjs';

export const sortCards = <C extends Card>(
  cards: FixedLengthTuple<6, C>,
): FixedLengthTuple<6, C> =>
  Arr.toSorted(cards, (a, b) =>
    a.number === b.number
      ? a.color === 'black'
        ? -1
        : 1
      : a.number - b.number,
  );
