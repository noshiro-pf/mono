import { Arr, pipe } from 'ts-data-forge';
import type { DeepReadonly, FixedLengthTuple, StrictOmit } from 'ts-type-forge';
import { getShuffled } from 'ts-utils-additional';
import {
  toShuffleDef,
  type Card,
  type Room,
  type ShuffleDef,
} from '../types/index.mjs';
import { sortCards } from './sort-cards.mjs';

const allCards: FixedLengthTuple<24, Card> = [
  { color: 'black', number: 0 },
  { color: 'black', number: 1 },
  { color: 'black', number: 2 },
  { color: 'black', number: 3 },
  { color: 'black', number: 4 },
  { color: 'black', number: 5 },
  { color: 'black', number: 6 },
  { color: 'black', number: 7 },
  { color: 'black', number: 8 },
  { color: 'black', number: 9 },
  { color: 'black', number: 10 },
  { color: 'black', number: 11 },
  { color: 'white', number: 0 },
  { color: 'white', number: 1 },
  { color: 'white', number: 2 },
  { color: 'white', number: 3 },
  { color: 'white', number: 4 },
  { color: 'white', number: 5 },
  { color: 'white', number: 6 },
  { color: 'white', number: 7 },
  { color: 'white', number: 8 },
  { color: 'white', number: 9 },
  { color: 'white', number: 10 },
  { color: 'white', number: 11 },
] as const;

export const newShuffleDef = (): ShuffleDef =>
  pipe(Arr.seq(4))
    .map(getShuffled)
    .map((list) => list.join(''))
    .map(toShuffleDef).value;

/**
 * A room nobody is in yet: its players are added to its `players` subcollection
 * once it has an id, its creator first.
 */
export const newRoom = (password: Room['password']): StrictOmit<Room, 'id'> =>
  ({
    state: 'not-started',
    password,
    playerCards: randomizePlayerCards(),
    shuffleDef: newShuffleDef(),
  }) as const;

// Written with annotated intermediates rather than a `pipe` chain: the
// length-constraint brands that `getShuffled` and `Arr.partition` produce do
// not survive being threaded through one another, and `FixedLengthTuple` can
// only be established by a guard.
const randomizePlayerCards = (): DeepReadonly<
  FixedLengthTuple<4, FixedLengthTuple<6, Card>>
> => {
  const shuffled: readonly Card[] = getShuffled(allCards);

  const chunks: readonly (readonly Card[])[] = Arr.partition(shuffled, 6);

  const sorted = chunks.map((cards) => {
    if (!Arr.isFixedLengthTuple(6, cards)) {
      throw new Error('each chunk should be of length 6');
    }

    return sortCards(cards);
  });

  if (!Arr.isFixedLengthTuple(4, sorted)) {
    throw new Error('listOfCards should be of length 4');
  }

  return sorted;
};
