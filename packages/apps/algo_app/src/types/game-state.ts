import { Player6Cards } from './player-6-card';
import { PlayerIndex } from './player-index';

export type GameState = Readonly<{
  currentPlayerIndex: PlayerIndex;
  playerCards: [Player6Cards, Player6Cards, Player6Cards, Player6Cards];
}>;
