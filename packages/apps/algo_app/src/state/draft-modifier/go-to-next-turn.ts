import type { WritableDraft } from 'immer/dist/internal';
import { incrementPlayerIndex } from '../../functions';
import type { GameState } from '../../types';

export const goToNextTurn = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  draft: WritableDraft<GameState>
): void => {
  draft.currentPlayerIndex = incrementPlayerIndex(draft.currentPlayerIndex, 1);
  draft.phase = 'ph000_startOfTheTurn';
  draft.decidedAnswerBalloonIsOpen = false;
  draft.judgeOnDecidedAnswerIsOpen = false;
};
