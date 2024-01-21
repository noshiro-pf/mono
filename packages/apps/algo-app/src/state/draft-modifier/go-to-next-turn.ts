import { incrementPlayerIndex } from '../../functions';
import { type GameState } from '../../types';

export const goToNextTurn = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  draft: DeepWritable<GameState>,
): void => {
  draft.currentPlayerIndex = incrementPlayerIndex(draft.currentPlayerIndex, 1);
  draft.phase = 'ph010_selectMyCardToToss';
  draft.decidedAnswerBalloonIsOpen = false;
  draft.judgeOnDecidedAnswerIsOpen = false;
};
