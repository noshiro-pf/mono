import { assertType, map, pipe, TypeExtends } from '@noshiro/ts-utils';
import { Card } from '../types/card-type';
import { Player6Cards } from '../types/player-6-card';

export const mapCards = <A>(mapFn: (card: Card) => A) => (
  cards: Player6Cards
): readonly [A, A, A, A, A, A] => pipe(cards).chain(map(mapFn)).value;

assertType<TypeExtends<Player6Cards, readonly Card[]>>();
