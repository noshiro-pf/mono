import { cardEq } from '../../functions';
import type { GameState, GameStateAction } from '../../types';

export const cardChosenToTossReducer: ReducerType<
  GameState['cardChosenToToss'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectMyCard':
      return cardEq(curr, action.card) ? undefined : action.card;
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
      return curr;
    case 'cancelToss':
    case 'submitToss':
    case 'goToNextTurn':
      return undefined;
  }
};
