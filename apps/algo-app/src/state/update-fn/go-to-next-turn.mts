import { incrementPlayerIndex } from '../../functions/index.mjs';
import type { GameState } from '../../types/index.mjs';

export const goToNextTurn = (state: GameState): GameState => ({
  ...state,
  currentPlayerIndex: incrementPlayerIndex(state.currentPlayerIndex, 1),
  phase: 'ph010_selectMyCardToToss',
  decidedAnswerBalloonIsOpen: false,
  judgeOnDecidedAnswerIsOpen: false,
});
