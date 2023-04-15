import { type GameState, type GameStateAction } from '../../types';

export const confirmTossBalloonIsOpenReducer: Reducer<
  GameState['confirmTossBalloonIsOpen'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectMyCard':
      return true;

    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
      return curr;

    case 'cancelToss':
    case 'submitToss':
    case 'goToNextTurn':
      return false;
  }
};
