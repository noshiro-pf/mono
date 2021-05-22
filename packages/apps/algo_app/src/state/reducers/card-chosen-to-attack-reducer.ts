import type { ReducerType } from '@noshiro/ts-utils';
import { cardEq } from '../../functions';
import type { GameState, GameStateAction } from '../../types';

export const cardChosenToAttackReducer: ReducerType<
  GameState['cardChosenToAttack'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectAttackCard':
      return cardEq(curr, action.card) ? undefined : action.card;
    case 'selectCardToAnswer':
    case 'selectAnswer':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
      return curr;
    case 'goToNextTurn':
      return undefined;
  }
};
