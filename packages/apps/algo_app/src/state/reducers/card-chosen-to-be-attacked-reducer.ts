import type { ReducerType } from '@noshiro/ts-utils';
import { cardEq } from '../../functions';
import type { GameState, GameStateAction } from '../../types';

export const cardChosenToBeAttackedReducer: ReducerType<
  GameState['cardChosenToBeAttacked'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectOpponentCard':
      return cardEq(curr, action.card) ? undefined : action.card;
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
    case 'selectAnswer':
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
      return curr;
    case 'cancelAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'goToNextTurn':
      return undefined;
  }
};
