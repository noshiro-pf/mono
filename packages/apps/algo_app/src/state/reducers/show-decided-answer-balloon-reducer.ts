import type { ReducerType } from '@noshiro/ts-utils';
import type { GameStateAction } from '../action';
import type { GameState } from '../game-state';

export const decidedAnswerBalloonIsOpenReducer: ReducerType<
  GameState['decidedAnswerBalloonIsOpen'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'submitAnswer':
      return true;
    case 'showJudgeOnDecidedAnswer':
      return curr;
    case 'selectCardToAnswer':
    case 'selectAnswer':
    case 'selectAttackCard':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'goToNextTurn':
      return false;
  }
};
