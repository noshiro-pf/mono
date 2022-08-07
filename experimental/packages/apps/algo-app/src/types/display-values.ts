import { type CardWithDisplayValue } from './card-type';
import { type NWES } from './direction';
import { type RoomRemote } from './room';

export type DisplayValues = Readonly<{
  playerCards: Record<NWES, ArrayOfLength<6, CardWithDisplayValue>>;
  playerNames: Record<NWES, string | undefined>;
  gameMessage: string;
  turnPlayer: NWES;
  cardsAreHidden: boolean;
  roomState: RoomRemote['state'];
  startGameButtonState: 'disabled' | 'hidden' | 'shown';
  endTurnButtonDisabled: boolean;
}>;
