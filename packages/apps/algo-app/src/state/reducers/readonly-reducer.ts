import { type GameState, type GameStateAction } from '../../types';

export const readonlyReducer: Reducer<
  GameState['readonly'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'initializePlayerCards':
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
