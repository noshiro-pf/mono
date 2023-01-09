import type { CardWithDisplayValue } from './card-type';
import type { NWES } from './direction';

export type DisplayValues = Readonly<{
  playerCards: Record<NWES, ArrayOfLength<6, CardWithDisplayValue>>;
  gameMessage: string;
  turnPlayer: NWES;
  endTurnButtonDisabled: boolean;
}>;
