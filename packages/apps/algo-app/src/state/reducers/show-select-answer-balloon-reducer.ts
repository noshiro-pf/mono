import { type GameState, type GameStateAction } from '../../types';

export const selectAnswerBalloonIsOpenReducer: Reducer<
  GameState['selectAnswerBalloonIsOpen'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectOpponentCard':
      return true;
    case 'selectAnswer':
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
      return curr;
    case 'initializePlayerCards':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'goToNextTurn':
      return false;
  }
};
