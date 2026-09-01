import { Arr, pipe } from 'ts-data-forge';
import {
  type DeepReadonly,
  type FixedLengthTuple,
  type StrictOmit,
} from 'ts-type-forge';
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

export const newShuffleDef = (): ShuffleDef =>
  pipe(Arr.seq(4))
    .map(getShuffled)
    .map((list) => list.join(''))
    .map(toShuffleDef).value;

export const newRoom = (
  password: Room['password'],
  player: Room['players'][0],
): StrictOmit<Room, 'id'> =>
  ({
    state: 'not-started',
    password,
    players: [player],
    playerCards: randomizePlayerCards(),
    shuffleDef: newShuffleDef(),
  }) as const;
