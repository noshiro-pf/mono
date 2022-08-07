import { type GameState, type GameStateAction } from '../../types';

export const decidedAnswerBalloonIsOpenReducer: Reducer<
  GameState['decidedAnswerBalloonIsOpen'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'submitAnswer':
      return true;
    case 'showJudgeOnDecidedAnswer':
    case 'cancelToss':
    case 'submitToss':
      return curr;
    case 'initializePlayerCards':
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'selectMyCard':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'goToNextTurn':
      return false;
  }
};
