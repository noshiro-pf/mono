import { cardEq } from '../functions';
import { type GameState, type GameStateAction } from '../types';
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
import { faceUpCard, goToNextTurn, tossCard } from './update-fn';

export const gameStateReducer: Reducer<
  GameState,
  readonly GameStateAction[]
> = (state, actions) => actions.reduce(gameStateReducer1Step, state);

const gameStateReducer1Step: Reducer<GameState, GameStateAction> = (
  currentState,
  action,
) =>
  pipe(currentState)
    .chain((state) =>
      Obj.merge<
        GameState,
        Pick<
          GameState,
          | 'answerSelected'
          | 'cardChosenToAttack'
          | 'cardChosenToBeAttacked'
          | 'cardChosenToToss'
          | 'confirmTossBalloonIsOpen'
          | 'decidedAnswerBalloonIsOpen'
          | 'readonly'
          | 'selectAnswerBalloonIsOpen'
        >
      >(state, {
        answerSelected: answerSelectedReducer(state.answerSelected, action),
        cardChosenToBeAttacked: cardChosenToBeAttackedReducer(
          state.cardChosenToBeAttacked,
          action,
        ),
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
      }),
    )
    .chain((state) => {
      switch (action.type) {
        case 'selectMyCard':
        case 'selectOpponentCard':
        case 'selectAnswer':
        case 'cancelToss':
        case 'cancelAnswer':
          return state;

        case 'initializePlayerCards':
          return Obj.set(state, 'playerCards', action.cards);

        case 'submitToss':
          if (state.cardChosenToToss === undefined) {
            console.warn(
              'gameState.cardChosenToToss should not be undefined here.',
            );
            return state;
          }
          return pipe(state)
            .chain((st) => tossCard(st, st.cardChosenToToss))
            .chain((st) => Obj.set(st, 'phase', 'ph020_firstAnswer')).value;

        case 'submitAnswer':
          return Obj.set(state, 'readonly', true);

        case 'showJudgeOnDecidedAnswer':
          if (state.answerSelected === undefined) {
            console.warn(
              'gameState.answerSelected should not be undefined here.',
            );
            return state;
          }
          if (state.cardChosenToBeAttacked === undefined) {
            console.warn(
              'gameState.cardChosenToBeAttacked should not be undefined here.',
            );
            return state;
          }

          return pipe(state)
            .chain((st) =>
              Obj.set(
                st,
                'judgeResult',
                cardEq(st.answerSelected, st.cardChosenToBeAttacked)
                  ? 'o'
                  : 'x',
              ),
            )
            .chain((st) =>
              st.judgeResult === undefined
                ? st
                : match(st.judgeResult, {
                    o: faceUpCard(st, st.cardChosenToBeAttacked),
                    x: faceUpCard(st, st.cardChosenToAttack),
                  }),
            ).value;

        case 'hideDecidedAnswerBalloon':
          return pipe(state)
            .chain((st) =>
              st.judgeResult === undefined
                ? st
                : match(st.judgeResult, {
                    x: pipe(st)
                      .chain((s) => Obj.set(s, 'cardChosenToAttack', undefined))
                      .chain(goToNextTurn).value,
                    o: match(st.phase, {
                      ph020_firstAnswer: Obj.set(
                        st,
                        'phase',
                        'ph030_continuousAnswer',
                      ),
                      ph010_selectMyCardToToss: st,
                      ph030_continuousAnswer: st,
                    }),
                  }),
            )
            .chain((st) => Obj.set(st, 'judgeResult', undefined)).value;

        case 'goToNextTurn':
          return goToNextTurn(state);
      }
    }).value;
