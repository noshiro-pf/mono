import type { GameState, GameStateAction } from '../../types';

export const decidedAnswerBalloonIsOpenReducer: ReducerType<
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
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'selectMyCard':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'goToNextTurn':
      return false;
  }
};