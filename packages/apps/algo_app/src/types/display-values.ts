import type { ReadonlyArrayOfLength, ReadonlyRecord } from '@noshiro/ts-utils';
import type { CardWithDisplayValue } from './card-type';
import type { Direction } from './direction';

export type DisplayValues = Readonly<{
  playerCards: ReadonlyRecord<
    Direction,
    ReadonlyArrayOfLength<6, CardWithDisplayValue>
  >;
  gameMessage: string;
  turnPlayer: Direction;
}>;
