import type { ReadonlyArrayOfLength, ReadonlyRecord } from '@noshiro/ts-utils';
import type { CardWithDisplayValue } from './card-type';
import type { NWES } from './direction';

export type DisplayValues = Readonly<{
  playerCards: ReadonlyRecord<
    NWES,
    ReadonlyArrayOfLength<6, CardWithDisplayValue>
  >;
  gameMessage: string;
  turnPlayer: NWES;
}>;
