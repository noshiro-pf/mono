import type { TypeExtends } from '@noshiro/ts-utils';
import { assertType, map, pipe } from '@noshiro/ts-utils';
import type { Card } from '../types/card-type';
import type { Player6Cards } from '../types/player-6-card';

export const mapCards =
  <A>(mapFn: (card: Card) => A) =>
  (cards: Player6Cards): readonly [A, A, A, A, A, A] =>
    pipe(cards).chain(map(mapFn)).value;

assertType<TypeExtends<Player6Cards, readonly Card[]>>();
