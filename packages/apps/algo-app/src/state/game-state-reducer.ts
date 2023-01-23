import { produce } from 'immer';
import { cardEq } from '../functions';
import { type GameState, type GameStateAction } from '../types';
import { faceUpCard, goToNextTurn, tossCard } from './draft-modifier';
import {
  answerSelectedReducer,
  cardChosenToAttackReducer,
  cardChosenToBeAttackedReducer,
  cardChosenToTossReducer,
  confirmTossBalloonIsOpenReducer,
  decidedAnswerBalloonIsOpenReducer,
  readonlyReducer,
  selectAnswerBalloonIsOpenReducer,
} from './reducers';

export const gameStateReducer: ReducerType<
  GameState,
  readonly GameStateAction[]
> = (state, actions) => actions.reduce(gameStateReducer1Step, state);

const gameStateReducer1Step: ReducerType<GameState, GameStateAction> = (
  state,
  action
) =>
  produce(state, (draft) => {
    draft.answerSelected = answerSelectedReducer(state.answerSelected, action);

    switch (state.phase) {
      case 'ph010_selectMyCardToToss':
        draft.cardChosenToToss = cardChosenToTossReducer(
          state.cardChosenToToss,
          action
        );
        break;

      case 'ph020_firstAnswer':
      case 'ph030_continuousAnswer':
        draft.cardChosenToAttack = cardChosenToAttackReducer(
          state.cardChosenToAttack,
          action
        );
        break;
    }

    draft.cardChosenToBeAttacked = cardChosenToBeAttackedReducer(
      state.cardChosenToBeAttacked,
      action
    );

    draft.confirmTossBalloonIsOpen = confirmTossBalloonIsOpenReducer(
      state.confirmTossBalloonIsOpen,
      action
    );

    draft.selectAnswerBalloonIsOpen = selectAnswerBalloonIsOpenReducer(
      state.selectAnswerBalloonIsOpen,
      action
    );

    draft.decidedAnswerBalloonIsOpen = decidedAnswerBalloonIsOpenReducer(
      state.decidedAnswerBalloonIsOpen,
      action
    );

    draft.readonly = readonlyReducer(draft.readonly, action);

    switch (action.type) {
      case 'selectMyCard':
      case 'selectOpponentCard':
      case 'selectAnswer':
      case 'cancelToss':
      case 'cancelAnswer':
        break;

      case 'submitToss':
        if (state.cardChosenToToss === undefined) {
          console.warn(
            'gameState.cardChosenToToss should not be undefined here.'
          );
          return;
        }
        tossCard(draft, state.cardChosenToToss);
        draft.phase = 'ph020_firstAnswer';
        break;

      case 'submitAnswer':
        draft.readonly = true;
        break;

      case 'showJudgeOnDecidedAnswer':
        if (draft.answerSelected === undefined) {
          console.warn(
            'gameState.answerSelected should not be undefined here.'
          );
          return;
        }
        if (draft.cardChosenToBeAttacked === undefined) {
          console.warn(
            'gameState.cardChosenToBeAttacked should not be undefined here.'
          );
          return;
        }

        draft.judgeResult = cardEq(
          draft.answerSelected,
          draft.cardChosenToBeAttacked
        )
          ? 'o'
          : 'x';

        switch (draft.judgeResult) {
          case 'o':
            faceUpCard(draft, draft.cardChosenToBeAttacked);
            break;
          case 'x':
            faceUpCard(draft, draft.cardChosenToAttack);
            break;
        }
        break;

      case 'hideDecidedAnswerBalloon':
        switch (draft.judgeResult) {
          case 'x':
            draft.cardChosenToAttack = undefined;
            goToNextTurn(draft);
            break;
          case 'o':
            switch (draft.phase) {
              case 'ph020_firstAnswer':
                draft.phase = 'ph030_continuousAnswer';
                break;
              case 'ph010_selectMyCardToToss':
              case 'ph030_continuousAnswer':
                break;
            }
            break;
          case undefined:
            break;
        }
        draft.judgeResult = undefined;
        break;

      case 'goToNextTurn':
        goToNextTurn(draft);
        break;
    }
  });
