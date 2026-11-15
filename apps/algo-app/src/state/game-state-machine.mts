import { Arr } from 'ts-data-forge';
import { defineMachine } from 'ts-fsm-forge';
import type { RelaxedExtract, StrictPick } from 'ts-type-forge';
import { cardEq, incrementPlayerIndex } from '../functions/index.mjs';
import type {
  AttackRound,
  Card,
  CardWithVisibility,
  GameState,
  GameStateAction,
  VisibleTo,
} from '../types/index.mjs';

type StateOf<T extends GameState['type']> = RelaxedExtract<
  GameState,
  Readonly<{ type: T }>
>;

/**
 * The attack an answering state would submit: `undefined` while the attacking
 * card or the answer is missing, in which case `submitAnswer` leaves the state
 * as it is and the submit button is disabled.
 */
export const answerToSubmit = (
  state: GameState,
):
  | Readonly<{
      cardChosenToAttack: Card;
      cardChosenToBeAttacked: Card;
      answerSelected: Card;
    }>
  | undefined => {
  if (state.type !== 'first.answering' && state.type !== 'cont.answering') {
    return undefined;
  }

  const { cardChosenToAttack, cardChosenToBeAttacked, answerSelected } = state;

  return cardChosenToAttack === undefined || answerSelected === undefined
    ? undefined
    : { cardChosenToAttack, cardChosenToBeAttacked, answerSelected };
};

/** What every state carries, whatever the turn is at. */
const table = (
  s: GameState,
): StrictPick<GameState, 'currentPlayerIndex' | 'playerCards'> =>
  ({
    playerCards: s.playerCards,
    currentPlayerIndex: s.currentPlayerIndex,
  }) as const;

const toggle = (curr: Card | undefined, clicked: Card): Card | undefined =>
  cardEq(curr, clicked) ? undefined : clicked;

const nextTurn = (s: GameState): StateOf<'toss.selecting'> =>
  ({
    type: 'toss.selecting',
    playerCards: s.playerCards,
    currentPlayerIndex: incrementPlayerIndex(s.currentPlayerIndex, 1),
  }) as const;

const setVisibility = (
  playerCards: GameState['playerCards'],
  card: Card,
  visibleTo: VisibleTo,
): GameState['playerCards'] => {
  const updateCard = (c: CardWithVisibility): CardWithVisibility =>
    cardEq(c, card) ? ({ ...c, visibleTo } as const) : c;

  const updateHand = (
    cards: GameState['playerCards'][number],
  ): GameState['playerCards'][number] => Arr.map(cards, updateCard);

  return Arr.map(playerCards, updateHand);
};

const submit = (
  s: StateOf<'cont.answering' | 'first.answering'>,
  round: AttackRound,
): StateOf<'judging.pending'> | undefined => {
  const attack = answerToSubmit(s);

  return attack === undefined
    ? undefined
    : { ...table(s), type: 'judging.pending', round, ...attack };
};

/**
 * The turn as a transition graph. The reducer ignores an action the current
 * state has no edge for, which is also what keeps an action replayed from the
 * room's log out of place from changing the game; the UI offers an action only
 * where {@link gameStateMachine.can} says the state takes it.
 *
 * `submitAnswer` is guarded: without an attacking card or an answer
 * ({@link answerToSubmit}) it leaves the state as it is, which is why it lists
 * its source among its targets.
 *
 * The old reducer accepted every action in every phase. A client still running
 * it folds a log holding an out-of-place action, or one of its two bugs,
 * differently; the room stores the actions rather than the state, so the
 * clients agree again once they all run this code.
 */
export const gameStateMachine = defineMachine<GameState, GameStateAction>()(
  {
    'toss.selecting': {
      selectMyCard: 'toss.confirming',
    },
    'toss.confirming': {
      selectMyCard: ['toss.selecting', 'toss.confirming'],
      cancelToss: 'toss.selecting',
      submitToss: 'first.selecting',
    },
    'first.selecting': {
      selectMyCard: 'first.selecting',
      selectOpponentCard: 'first.answering',
    },
    'first.answering': {
      selectMyCard: 'first.answering',
      selectOpponentCard: ['first.selecting', 'first.answering'],
      selectAnswer: 'first.answering',
      cancelAnswer: 'first.selecting',
      submitAnswer: ['judging.pending', 'first.answering'],
    },
    'cont.selecting': {
      selectOpponentCard: 'cont.answering',
      goToNextTurn: 'toss.selecting',
    },
    'cont.answering': {
      selectOpponentCard: ['cont.selecting', 'cont.answering'],
      selectAnswer: 'cont.answering',
      cancelAnswer: 'cont.selecting',
      submitAnswer: ['judging.pending', 'cont.answering'],
      goToNextTurn: 'toss.selecting',
    },
    'judging.pending': {
      showJudgeOnDecidedAnswer: 'judging.shown',
    },
    'judging.shown': {
      hideDecidedAnswerBalloon: ['toss.selecting', 'cont.selecting'],
    },
  },
  {
    'toss.selecting': {
      selectMyCard: (s, a) => ({
        ...table(s),
        type: 'toss.confirming',
        cardChosenToToss: a.card,
      }),
    },
    'toss.confirming': {
      selectMyCard: (s, a) =>
        cardEq(s.cardChosenToToss, a.card)
          ? { ...table(s), type: 'toss.selecting' }
          : { ...s, cardChosenToToss: a.card },
      cancelToss: (s) => ({ ...table(s), type: 'toss.selecting' }),
      submitToss: (s) => ({
        type: 'first.selecting',
        playerCards: setVisibility(s.playerCards, s.cardChosenToToss, 'pair'),
        currentPlayerIndex: s.currentPlayerIndex,
        cardChosenToAttack: undefined,
      }),
    },
    'first.selecting': {
      selectMyCard: (s, a) => ({
        ...s,
        cardChosenToAttack: toggle(s.cardChosenToAttack, a.card),
      }),
      selectOpponentCard: (s, a) => ({
        ...s,
        type: 'first.answering',
        cardChosenToBeAttacked: a.card,
        answerSelected: undefined,
      }),
    },
    'first.answering': {
      selectMyCard: (s, a) => ({
        ...s,
        cardChosenToAttack: toggle(s.cardChosenToAttack, a.card),
      }),
      selectOpponentCard: (s, a) =>
        cardEq(s.cardChosenToBeAttacked, a.card)
          ? {
              ...table(s),
              type: 'first.selecting',
              cardChosenToAttack: s.cardChosenToAttack,
            }
          : // An answer is given for the card attacked; another card starts
            // without one.
            { ...s, cardChosenToBeAttacked: a.card, answerSelected: undefined },
      selectAnswer: (s, a) => ({
        ...s,
        answerSelected: toggle(s.answerSelected, a.answer),
      }),
      cancelAnswer: (s) => ({
        ...table(s),
        type: 'first.selecting',
        cardChosenToAttack: s.cardChosenToAttack,
      }),
      submitAnswer: (s) => submit(s, 'first') ?? s,
    },
    'cont.selecting': {
      selectOpponentCard: (s, a) => ({
        ...s,
        type: 'cont.answering',
        cardChosenToBeAttacked: a.card,
        answerSelected: undefined,
      }),
      goToNextTurn: nextTurn,
    },
    // The same as `first.answering`'s, but for the tag: a helper over both
    // would have to assert which tag it returns.
    'cont.answering': {
      selectOpponentCard: (s, a) =>
        cardEq(s.cardChosenToBeAttacked, a.card)
          ? {
              ...table(s),
              type: 'cont.selecting',
              cardChosenToAttack: s.cardChosenToAttack,
            }
          : { ...s, cardChosenToBeAttacked: a.card, answerSelected: undefined },
      selectAnswer: (s, a) => ({
        ...s,
        answerSelected: toggle(s.answerSelected, a.answer),
      }),
      cancelAnswer: (s) => ({
        ...table(s),
        type: 'cont.selecting',
        cardChosenToAttack: s.cardChosenToAttack,
      }),
      submitAnswer: (s) => submit(s, 'cont') ?? s,
      goToNextTurn: nextTurn,
    },
    'judging.pending': {
      showJudgeOnDecidedAnswer: (s) => {
        const judgeResult = cardEq(s.answerSelected, s.cardChosenToBeAttacked)
          ? 'o'
          : 'x';

        return {
          ...s,
          type: 'judging.shown',
          judgeResult,
          // A right answer shows the card attacked; a wrong one gives away the
          // card it was attacked with.
          playerCards: setVisibility(
            s.playerCards,
            judgeResult === 'o'
              ? s.cardChosenToBeAttacked
              : s.cardChosenToAttack,
            'everyone',
          ),
        };
      },
    },
    'judging.shown': {
      hideDecidedAnswerBalloon: (s) =>
        s.judgeResult === 'o'
          ? {
              ...table(s),
              type: 'cont.selecting',
              cardChosenToAttack: s.cardChosenToAttack,
            }
          : nextTurn(s),
    },
  },
);
