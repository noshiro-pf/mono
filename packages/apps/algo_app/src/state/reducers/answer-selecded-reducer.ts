import type { ReducerType } from '@noshiro/ts-utils';
import { cardEq } from '../../functions';
import type { GameState, GameStateAction } from '../../types';

export const answerSelectedReducer: ReducerType<
  GameState['answerSelected'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectAnswer':
      return cardEq(curr, action.answer) ? undefined : action.answer;
    case 'selectCardToAnswer':
    case 'selectAttackCard':
      return curr;
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'goToNextTurn':
      return undefined;
  }
};
