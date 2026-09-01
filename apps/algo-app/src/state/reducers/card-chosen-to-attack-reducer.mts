import { type Reducer } from 'ts-type-forge';
import { cardEq } from '../../functions/index.mjs';
import { type GameState, type GameStateAction } from '../../types/index.mjs';

export const cardChosenToAttackReducer: Reducer<
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
