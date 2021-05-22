import type { ReducerType } from '@noshiro/ts-utils';
import { cardEq } from '../../functions';
import type { GameState, GameStateAction } from '../../types';

export const cardChosenToBeAttackedReducer: ReducerType<
  GameState['cardChosenToBeAttacked'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectCardToAnswer':
      return cardEq(curr, action.card) ? undefined : action.card;
    case 'selectAttackCard':
    case 'selectAnswer':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
      return curr;
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'goToNextTurn':
      return undefined;
  }
};
