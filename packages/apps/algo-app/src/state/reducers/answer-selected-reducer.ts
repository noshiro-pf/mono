import { cardEq } from '../../functions';
import { type GameState, type GameStateAction } from '../../types';

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
