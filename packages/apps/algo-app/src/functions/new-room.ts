import { getShuffled } from '@noshiro/ts-utils-additional';
import { toShuffleDef, type Card, type Room, type ShuffleDef } from '../types';
import { sortCards } from './sort-cards';

const allCards: ArrayOfLength<24, Card> = [
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
];

const randomizePlayerCards = (): DeepReadonly<
  ArrayOfLength<4, ArrayOfLength<6, Card>>
> =>
  pipe(allCards)
    .chain(getShuffled)
    .chain((cards) => Arr.partition(cards, 6))
    .chain((cards) => Tpl.map(cards, sortCards))
    .chain((listOfCards) => {
      if (!Arr.isArrayOfLength4(listOfCards)) {
        throw new Error('listOfCards should be of length 4');
      }
      return listOfCards;
    }).value;

export const newShuffleDef = (): ShuffleDef =>
  pipe(Arr.seq(4))
    .chain(getShuffled)
    .chain((list) => list.join(''))
    .chain(toShuffleDef).value;

export const newRoom = (
  password: Room['password'],
  player: Room['players'][0],
): Omit<Room, 'id'> => ({
  state: 'not-started',
  password,
  players: [player],
  playerCards: randomizePlayerCards(),
  shuffleDef: newShuffleDef(),
});
