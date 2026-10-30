import { produce } from 'immer';
import type { Reducer } from 'ts-type-forge';
import { cardEq } from '../functions/index.mjs';
import type { GameState, GameStateAction } from '../types/index.mjs';
import { faceUpCard, goToNextTurn, tossCard } from './draft-modifier/index.mjs';
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

export const gameStateReducer: Reducer<
  GameState,
  readonly GameStateAction[]
> = (state, actions) => actions.reduce(gameStateReducer1Step, state);

const gameStateReducer1Step: Reducer<GameState, GameStateAction> = (
  state,
  action,
) =>
  produce(state, (mut_draft) => {
    mut_draft.answerSelected = answerSelectedReducer(
      state.answerSelected,
      action,
    );

    switch (state.phase) {
      case 'ph010_selectMyCardToToss':
        mut_draft.cardChosenToToss = cardChosenToTossReducer(
          state.cardChosenToToss,
          action,
        );

        break;

      case 'ph020_firstAnswer':
      case 'ph030_continuousAnswer':
        mut_draft.cardChosenToAttack = cardChosenToAttackReducer(
          state.cardChosenToAttack,
          action,
        );

        break;
    }

    mut_draft.cardChosenToBeAttacked = cardChosenToBeAttackedReducer(
      state.cardChosenToBeAttacked,
      action,
    );

    mut_draft.confirmTossBalloonIsOpen = confirmTossBalloonIsOpenReducer(
      state.confirmTossBalloonIsOpen,
      action,
    );

    mut_draft.selectAnswerBalloonIsOpen = selectAnswerBalloonIsOpenReducer(
      state.selectAnswerBalloonIsOpen,
      action,
    );

    mut_draft.decidedAnswerBalloonIsOpen = decidedAnswerBalloonIsOpenReducer(
      state.decidedAnswerBalloonIsOpen,
      action,
    );

    mut_draft.readonly = readonlyReducer(mut_draft.readonly, action);

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
            'gameState.cardChosenToToss should not be undefined here.',
          );

          return;
        }

        tossCard(mut_draft, state.cardChosenToToss);

        mut_draft.phase = 'ph020_firstAnswer';

        break;

      case 'submitAnswer':
        mut_draft.readonly = true;

        break;

      case 'showJudgeOnDecidedAnswer':
        if (mut_draft.answerSelected === undefined) {
          console.warn(
            'gameState.answerSelected should not be undefined here.',
          );

          return;
        }

        if (mut_draft.cardChosenToBeAttacked === undefined) {
          console.warn(
            'gameState.cardChosenToBeAttacked should not be undefined here.',
          );

          return;
        }

        mut_draft.judgeResult = cardEq(
          mut_draft.answerSelected,
          mut_draft.cardChosenToBeAttacked,
        )
          ? 'o'
          : 'x';

        switch (mut_draft.judgeResult) {
          case 'o':
            faceUpCard(mut_draft, mut_draft.cardChosenToBeAttacked);

            break;
          case 'x':
            faceUpCard(mut_draft, mut_draft.cardChosenToAttack);

            break;
        }

        break;

      case 'hideDecidedAnswerBalloon':
        switch (mut_draft.judgeResult) {
          case 'x':
            mut_draft.cardChosenToAttack = undefined;

            goToNextTurn(mut_draft);

            break;
          case 'o':
            switch (mut_draft.phase) {
              case 'ph020_firstAnswer':
                mut_draft.phase = 'ph030_continuousAnswer';

                break;
              case 'ph010_selectMyCardToToss':
              case 'ph030_continuousAnswer':
                break;
            }

            break;
          case undefined:
            break;
        }

        mut_draft.judgeResult = undefined;

        break;

      case 'goToNextTurn':
        goToNextTurn(mut_draft);

        break;
    }
  });
