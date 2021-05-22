import type { ReducerType } from '@noshiro/ts-utils';
import { produce } from 'immer';
import { cardEq } from '../functions';
import type { GameState, GameStateAction } from '../types';
import { faceUpCard, goToNextTurn } from './draft-modifier';
import {
  answerSelectedReducer,
  cardChosenToAttackReducer,
  cardChosenToBeAttackedReducer,
  decidedAnswerBalloonIsOpenReducer,
  selectAnswerBalloonIsOpenReducer,
} from './reducers';

export const gameStateReducer: ReducerType<GameState, GameStateAction> = (
  state,
  action
) =>
  produce(state, (draft) => {
    draft.answerSelected = answerSelectedReducer(state.answerSelected, action);

    draft.cardChosenToAttack = cardChosenToAttackReducer(
      state.cardChosenToAttack,
      action
    );

    draft.cardChosenToBeAttacked = cardChosenToBeAttackedReducer(
      state.cardChosenToBeAttacked,
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

    switch (action.type) {
      case 'selectAttackCard':
      case 'selectCardToAnswer':
      case 'selectAnswer':
      case 'cancelAnswer':
      case 'submitAnswer':
        break;

      case 'showJudgeOnDecidedAnswer':
        if (state.answerSelected === undefined) {
          console.warn(
            'gameState.answerSelected should not be undefined here.'
          );
          return;
        }
        if (state.cardChosenToBeAttacked === undefined) {
          console.warn(
            'gameState.cardChosenToBeAttacked should not be undefined here.'
          );
          return;
        }

        draft.judgeResult = cardEq(
          state.answerSelected,
          state.cardChosenToBeAttacked
        )
          ? 'o'
          : 'x';

        switch (draft.judgeResult) {
          case 'o':
            faceUpCard(draft, state.cardChosenToBeAttacked);
            break;
          case 'x':
            faceUpCard(draft, state.cardChosenToAttack);
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
            switch (state.phase) {
              case 'ph030_firstAnswer':
                // draft.phase = phaseReducer([
                //   state.phase,
                //   'ac040_submitFirstAnswerAndSuccess',
                // ]);
                break;
              case 'ph040_continuousAnswer':
                // draft.phase = phaseReducer([
                //   state.phase,
                //   'ac070_submitSecondAnswerAndSuccess',
                // ]);
                break;
              default:
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
