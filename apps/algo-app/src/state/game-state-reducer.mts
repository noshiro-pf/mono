import { match } from 'ts-data-forge';
import type { Reducer } from 'ts-type-forge';
import { cardEq } from '../functions/index.mjs';
import {
  fromPlayerCardsRemote,
  type GameState,
  type GameStateAction,
} from '../types/index.mjs';
import {
  answerSelectedReducer,
  cardChosenToAttackReducer,
  cardChosenToBeAttackedReducer,
  cardChosenToTossReducer,
  confirmTossBalloonIsOpenReducer,
  decidedAnswerBalloonIsOpenReducer,
  readonlyReducer,
  selectAnswerBalloonIsOpenReducer,
} from './reducers/index.mjs';
import { faceUpCard, goToNextTurn, tossCard } from './update-fn/index.mjs';

export const gameStateReducer: Reducer<
  GameState,
  readonly GameStateAction[]
> = (state, actions) => actions.reduce(gameStateReducer1Step, state);

const reduceFields = (
  state: GameState,
  action: GameStateAction,
): GameState => ({
  ...state,
  answerSelected: answerSelectedReducer(state.answerSelected, action),
  cardChosenToToss: match(state.phase, {
    ph010_selectMyCardToToss: cardChosenToTossReducer(
      state.cardChosenToToss,
      action,
    ),
    ph020_firstAnswer: state.cardChosenToToss,
    ph030_continuousAnswer: state.cardChosenToToss,
  }),
  cardChosenToAttack: match(state.phase, {
    ph010_selectMyCardToToss: state.cardChosenToAttack,
    ph020_firstAnswer: cardChosenToAttackReducer(
      state.cardChosenToAttack,
      action,
    ),
    ph030_continuousAnswer: cardChosenToAttackReducer(
      state.cardChosenToAttack,
      action,
    ),
  }),
  cardChosenToBeAttacked: cardChosenToBeAttackedReducer(
    state.cardChosenToBeAttacked,
    action,
  ),
  confirmTossBalloonIsOpen: confirmTossBalloonIsOpenReducer(
    state.confirmTossBalloonIsOpen,
    action,
  ),
  selectAnswerBalloonIsOpen: selectAnswerBalloonIsOpenReducer(
    state.selectAnswerBalloonIsOpen,
    action,
  ),
  decidedAnswerBalloonIsOpen: decidedAnswerBalloonIsOpenReducer(
    state.decidedAnswerBalloonIsOpen,
    action,
  ),
  readonly: readonlyReducer(state.readonly, action),
});

const afterJudge = (state: GameState): GameState => {
  switch (state.judgeResult) {
    case 'x':
      return goToNextTurn({ ...state, cardChosenToAttack: undefined });

    case 'o':
      return state.phase === 'ph020_firstAnswer'
        ? { ...state, phase: 'ph030_continuousAnswer' }
        : state;

    case undefined:
      return state;
  }
};

const applyAction = (state: GameState, action: GameStateAction): GameState => {
  switch (action.type) {
    case 'selectMyCard':
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'cancelToss':
    case 'cancelAnswer':
      return state;

    case 'initializePlayerCards':
      return { ...state, playerCards: fromPlayerCardsRemote(action.cards) };

    case 'submitToss':
      if (state.cardChosenToToss === undefined) {
        console.warn(
          'gameState.cardChosenToToss should not be undefined here.',
        );

        return state;
      }

      return {
        ...tossCard(state, state.cardChosenToToss),
        phase: 'ph020_firstAnswer',
      };

    case 'submitAnswer':
      return { ...state, readonly: true };

    case 'showJudgeOnDecidedAnswer': {
      if (state.answerSelected === undefined) {
        console.warn('gameState.answerSelected should not be undefined here.');

        return state;
      }

      if (state.cardChosenToBeAttacked === undefined) {
        console.warn(
          'gameState.cardChosenToBeAttacked should not be undefined here.',
        );

        return state;
      }

      const judgeResult = cardEq(
        state.answerSelected,
        state.cardChosenToBeAttacked,
      )
        ? 'o'
        : 'x';

      const judged: GameState = { ...state, judgeResult };

      return judgeResult === 'o'
        ? faceUpCard(judged, judged.cardChosenToBeAttacked)
        : faceUpCard(judged, judged.cardChosenToAttack);
    }

    case 'hideDecidedAnswerBalloon':
      return { ...afterJudge(state), judgeResult: undefined };

    case 'goToNextTurn':
      return goToNextTurn(state);
  }
};

/**
 * The fields each have a reducer of their own, run first; what an action does
 * beyond them is `applyAction`. Written without `immer`: every step returns a
 * new state.
 */
const gameStateReducer1Step: Reducer<GameState, GameStateAction> = (
  state,
  action,
) => applyAction(reduceFields(state, action), action);
