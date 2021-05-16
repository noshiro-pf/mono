import type { ReducerType } from '@noshiro/ts-utils';
import type { GameStateAction } from '../action';
import type { GameState } from '../game-state';

export const selectAnswerBalloonIsOpenReducer: ReducerType<
  GameState['selectAnswerBalloonIsOpen'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectCardToAnswer':
      return true;
    case 'selectAnswer':
    case 'selectAttackCard':
      return curr;
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'goToNextTurn':
      return false;
  }
};
