import { type FixedLengthTuple, type ReadonlyRecord } from 'ts-type-forge';
import { type CardWithDisplayValue } from './card-type.mjs';
import { type NWES } from './direction.mjs';

export type DisplayValues = Readonly<{
  playerCards: ReadonlyRecord<NWES, FixedLengthTuple<6, CardWithDisplayValue>>;
  gameMessage: string;
  turnPlayer: NWES;
  endTurnButtonDisabled: boolean;
}>;
