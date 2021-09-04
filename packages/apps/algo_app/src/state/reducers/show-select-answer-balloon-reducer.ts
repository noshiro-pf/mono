import type { ReducerType } from '@noshiro/ts-utils';
import type { GameState, GameStateAction } from '../../types';

export const selectAnswerBalloonIsOpenReducer: ReducerType<
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
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'goToNextTurn':
      return false;
  }
};
