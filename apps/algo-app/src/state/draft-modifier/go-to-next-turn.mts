import { type DeepMutable } from 'ts-type-forge';
import { incrementPlayerIndex } from '../../functions/index.mjs';
import { type GameState } from '../../types/index.mjs';

export const goToNextTurn = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  draft: DeepMutable<GameState>,
): void => {
  draft.currentPlayerIndex = incrementPlayerIndex(draft.currentPlayerIndex, 1);

  draft.phase = 'ph010_selectMyCardToToss';

  draft.decidedAnswerBalloonIsOpen = false;

  draft.judgeOnDecidedAnswerIsOpen = false;
};
