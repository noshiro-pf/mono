import { type Reducer } from 'ts-type-forge';
import { cardEq } from '../../functions/index.mjs';
import { type GameState, type GameStateAction } from '../../types/index.mjs';

export const answerSelectedReducer: Reducer<
  GameState['answerSelected'],
  GameStateAction
> = (curr, action) => {
  switch (action.type) {
    case 'selectAnswer':
      return cardEq(curr, action.answer) ? undefined : action.answer;
    case 'selectOpponentCard':
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
      return curr;
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'goToNextTurn':
      return undefined;
  }
};
