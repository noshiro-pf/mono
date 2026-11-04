import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import type { CardWithDisplayValue } from './card-type.mjs';
import type { NWES } from './direction.mjs';
import type { RoomState } from './room.mjs';

export type DisplayValues = Readonly<{
  playerCards: ReadonlyRecord<NWES, FixedLengthTuple<6, CardWithDisplayValue>>;
  /** Each seat's player, or `undefined` while the seat is empty. */
  playerNames: ReadonlyRecord<NWES, string | undefined>;
  gameMessage: string;
  turnPlayer: NWES;
  /** Before the game starts, every card is drawn as a blank placeholder. */
  cardsAreHidden: boolean;
  roomState: RoomState;
  startGameButtonState: 'disabled' | 'hidden' | 'shown';
  endTurnButtonDisabled: boolean;
}>;
