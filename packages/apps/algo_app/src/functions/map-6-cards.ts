import { assertType, TypeExtends } from '@noshiro/ts-utils';
import { Card } from '../types/card-type';
import { Player6Cards } from '../types/player-6-card';

export const mapCards = <A>(mapFn: (card: Card) => A) => (
  cards: Player6Cards
): readonly [A, A, A, A, A, A] =>
  (cards.map(mapFn) as unknown) as readonly [A, A, A, A, A, A];

assertType<TypeExtends<Player6Cards, readonly Card[]>>();
