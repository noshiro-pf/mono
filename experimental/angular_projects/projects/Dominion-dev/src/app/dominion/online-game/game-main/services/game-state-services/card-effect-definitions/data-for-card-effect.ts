import { GameState } from '../../../../types/game-state';

export interface DataForCardEffect {
  shuffleBy: number[];
  gameState: GameState;
  gameStateSetter: (gst: GameState) => void;
  playersNameList: string[];
  messager: (msg: string) => void;
}
