import type { GameState, GameStateAction } from '../../types';

export const readonlyReducer: ReducerType<
  GameState['readonly'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'cancelAnswer':
      return curr;

    case 'goToNextTurn':
    case 'hideDecidedAnswerBalloon':
      return false;

    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
      return true;
  }
};
