import { cardEq } from '../../functions';
import type { GameState, GameStateAction } from '../../types';

export const cardChosenToAttackReducer: ReducerType<
  GameState['cardChosenToAttack'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectMyCard':
      return cardEq(curr, action.card) ? undefined : action.card;
    case 'selectOpponentCard':
    case 'cancelToss':
    case 'submitToss':
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