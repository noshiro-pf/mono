import type { DeepMutable } from 'ts-type-forge';
import { incrementPlayerIndex } from '../../functions/index.mjs';
import type { GameState } from '../../types/index.mjs';

export const goToNextTurn = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_draft: DeepMutable<GameState>,
): void => {
  mut_draft.currentPlayerIndex = incrementPlayerIndex(
    mut_draft.currentPlayerIndex,
    1,
  );

  mut_draft.phase = 'ph010_selectMyCardToToss';

  mut_draft.decidedAnswerBalloonIsOpen = false;

  mut_draft.judgeOnDecidedAnswerIsOpen = false;
};
