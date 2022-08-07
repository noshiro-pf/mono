import { incrementPlayerIndex } from '../../functions';
import { type GameState } from '../../types';

export const goToNextTurn = (state: GameState): GameState =>
  Obj.merge<
    GameState,
    Pick<
      GameState,
      | 'currentPlayerIndex'
      | 'decidedAnswerBalloonIsOpen'
      | 'judgeOnDecidedAnswerIsOpen'
      | 'phase'
    >
  >(state, {
    currentPlayerIndex: incrementPlayerIndex(state.currentPlayerIndex, 1),
    phase: 'ph010_selectMyCardToToss',
    decidedAnswerBalloonIsOpen: false,
    judgeOnDecidedAnswerIsOpen: false,
  });
