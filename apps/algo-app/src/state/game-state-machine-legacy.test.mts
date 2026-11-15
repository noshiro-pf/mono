/**
 * The reducer the graph replaced, run side by side with the machine on the
 * actions the page lets the current player send, agrees with it on everything
 * drawn and on what the page offers next — except where the old one had its two
 * bugs, which the walk steers around: a change of target with an answer
 * selected, and a submit with none.
 *
 * The old reducer is at the end of this file, as it was less its `console.warn`
 * calls: one field reducer per field, each accepting every action in every
 * phase. Do not fix or tidy it; it is the oracle.
 */

import { Timestamp } from 'firebase/firestore';
import { produce } from 'immer';
import { Arr, asUint32 } from 'ts-data-forge';
import type { DeepMutable, FixedLengthTuple, StrictPick } from 'ts-type-forge';
import { cardEq, incrementPlayerIndex } from '../functions/index.mjs';
import type {
  Card,
  CardNumber,
  CardWithVisibility,
  GameState,
  GameStateAction,
  PlayerIndex,
} from '../types/index.mjs';
import { chosenCards } from './chosen-cards.mjs';
import { answerToSubmit, gameStateMachine } from './game-state-machine.mjs';
import { initialGameState } from './initial-game-state.mjs';

describe('agrees with the reducer it replaced, outside its two bugs', () => {
  test.each(Arr.seq(20))('walk %i', (seed) => {
    const random = mulberry32(seed + 1);

    let mut_legacy: LegacyGameState = legacyInitialState;

    let mut_state: GameState = initialGameState;

    for (const _ of Arr.seq(asUint32(400))) {
      const legacy = mut_legacy;

      const legacyOffers = legacyUiActions(legacy);

      // The old submit button ignored the answer (the second bug).
      assert.deepStrictEqual(
        uiActions(mut_state),
        legacyOffers.filter(
          (a) => a[0] !== 'submitAnswer' || legacy.answerSelected !== undefined,
        ),
      );

      const choices = legacyOffers.filter(
        (a) =>
          !(
            // The first bug: the answer survives a change of target.
            (a[0] === 'selectOpponentCard' &&
              legacy.answerSelected !== undefined) ||
            // The second bug: a submit with no answer.
            (a[0] === 'submitAnswer' && legacy.answerSelected === undefined)
          ),
      );

      if (!Arr.isNonEmpty(choices)) {
        break;
      }

      const choice = choices[Math.floor(random() * choices.length)];

      assert.isDefined(choice);

      for (const action of toActions(choice)) {
        mut_legacy = legacyGameStateReducer(mut_legacy, action);

        mut_state = gameStateMachine.reducer(mut_state, action);

        assert.deepStrictEqual(view(mut_state), legacyView(mut_legacy));

        mut_visited.add(mut_state.type);
      }
    }
  });

  afterAll(() => {
    // The walks reach every state, so that the comparison covers the whole turn
    // rather than the toss phase alone.
    assert.deepStrictEqual(
      new Set(mut_visited),
      new Set(Object.keys(gameStateMachine.graph)),
    );
  });

  const mut_visited = new Set<GameState['type']>();
});

const ts = Timestamp.fromMillis(0);

const submitAnswer = (): GameStateAction =>
  ({ type: 'submitAnswer', timestamp: ts }) as const;

const showJudge = (): GameStateAction =>
  ({ type: 'showJudgeOnDecidedAnswer', timestamp: ts }) as const;

const hideBalloon = (): GameStateAction =>
  ({ type: 'hideDecidedAnswerBalloon', timestamp: ts }) as const;

/** A click on the page; a submit is followed by the two timed actions. */
type UiAction = readonly [GameStateAction['type'], Card | undefined];

const toActions = ([type, card]: UiAction): readonly GameStateAction[] => {
  switch (type) {
    case 'selectMyCard':
    case 'selectOpponentCard':
      assert.isDefined(card);

      return [{ type, timestamp: ts, card }];

    case 'selectAnswer':
      assert.isDefined(card);

      return [{ type, timestamp: ts, answer: card }];

    case 'submitAnswer':
      return [submitAnswer(), showJudge(), hideBalloon()];

    case 'cancelToss':
    case 'submitToss':
    case 'cancelAnswer':
    case 'goToNextTurn':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
      return [{ type, timestamp: ts }];
  }
};

const notFaceUp = (cards: GameState['playerCards'][number]): readonly Card[] =>
  cards
    .filter((c) => c.visibleTo !== 'everyone')
    .map(({ color, number }) => ({ color, number }));

/** The current player's cards, then those of the players on either side. */
const cardsOnTable = (
  state: StrictPick<GameState, 'currentPlayerIndex' | 'playerCards'>,
): Readonly<{ mine: readonly Card[]; opponents: readonly Card[] }> =>
  ({
    mine: notFaceUp(state.playerCards[state.currentPlayerIndex]),
    opponents: [
      ...notFaceUp(
        state.playerCards[incrementPlayerIndex(state.currentPlayerIndex, 1)],
      ),
      ...notFaceUp(
        state.playerCards[incrementPlayerIndex(state.currentPlayerIndex, 3)],
      ),
    ],
  }) as const;

const cardNumbers = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
] as const satisfies readonly CardNumber[];

const answers = (target: Card): readonly UiAction[] =>
  cardNumbers.map(
    (n) => ['selectAnswer', { color: target.color, number: n }] as const,
  );

/** What the page offers the current player, read as the old page read it. */
const legacyUiActions = (s: LegacyGameState): readonly UiAction[] => {
  const { mine, opponents } = cardsOnTable(s);

  return [
    ...(!s.readonly && s.phase !== 'ph030_continuousAnswer'
      ? mine.map((c) => ['selectMyCard', c] as const)
      : []),
    ...(!s.readonly && s.phase !== 'ph010_selectMyCardToToss'
      ? opponents.map((c) => ['selectOpponentCard', c] as const)
      : []),
    ...(s.confirmTossBalloonIsOpen && s.cardChosenToToss !== undefined
      ? ([
          ['cancelToss', undefined],
          ['submitToss', undefined],
        ] as const)
      : []),
    ...(s.selectAnswerBalloonIsOpen && s.cardChosenToBeAttacked !== undefined
      ? [
          ...answers(s.cardChosenToBeAttacked),
          ['cancelAnswer', undefined] as const,
          ...(s.cardChosenToAttack === undefined
            ? []
            : [['submitAnswer', undefined] as const]),
        ]
      : []),
    ...(s.phase === 'ph030_continuousAnswer' && !s.readonly
      ? [['goToNextTurn', undefined] as const]
      : []),
  ];
};

/** What the page offers the current player, read off the graph. */
const uiActions = (s: GameState): readonly UiAction[] => {
  const { mine, opponents } = cardsOnTable(s);

  const can = (type: GameStateAction['type']): boolean =>
    gameStateMachine.can(s, type);

  return [
    ...(can('selectMyCard')
      ? mine.map((c) => ['selectMyCard', c] as const)
      : []),
    ...(can('selectOpponentCard')
      ? opponents.map((c) => ['selectOpponentCard', c] as const)
      : []),
    ...(s.type === 'toss.confirming'
      ? ([
          ['cancelToss', undefined],
          ['submitToss', undefined],
        ] as const)
      : []),
    ...(s.type === 'first.answering' || s.type === 'cont.answering'
      ? [
          ...answers(s.cardChosenToBeAttacked),
          ['cancelAnswer', undefined] as const,
          ...(answerToSubmit(s) === undefined
            ? []
            : [['submitAnswer', undefined] as const]),
        ]
      : []),
    ...(can('goToNextTurn') ? [['goToNextTurn', undefined] as const] : []),
  ];
};

/** What the page draws, in terms both states can be read in. */
type View = Readonly<{
  playerCards: GameState['playerCards'];
  currentPlayerIndex: GameState['currentPlayerIndex'];
  phase: 'cont' | 'first' | 'toss';
  cardChosenToToss: Card | undefined;
  cardChosenToAttack: Card | undefined;
  cardChosenToBeAttacked: Card | undefined;
  tossBalloon: Card | undefined;
  answerBalloon: Readonly<{ answer: Card | undefined }> | undefined;
  decidedBalloon:
    Readonly<{ answer: Card; judgeResult: 'o' | 'x' | undefined }> | undefined;
}>;

const legacyView = (s: LegacyGameState): View =>
  ({
    playerCards: s.playerCards,
    currentPlayerIndex: s.currentPlayerIndex,
    phase:
      s.phase === 'ph010_selectMyCardToToss'
        ? ('toss' as const)
        : s.phase === 'ph020_firstAnswer'
          ? ('first' as const)
          : ('cont' as const),
    cardChosenToToss: s.cardChosenToToss,
    cardChosenToAttack: s.cardChosenToAttack,
    cardChosenToBeAttacked: s.cardChosenToBeAttacked,
    tossBalloon: s.confirmTossBalloonIsOpen ? s.cardChosenToToss : undefined,
    answerBalloon:
      s.selectAnswerBalloonIsOpen && s.cardChosenToBeAttacked !== undefined
        ? ({ answer: s.answerSelected } as const)
        : undefined,
    decidedBalloon:
      s.decidedAnswerBalloonIsOpen &&
      s.answerSelected !== undefined &&
      s.cardChosenToBeAttacked !== undefined
        ? ({ answer: s.answerSelected, judgeResult: s.judgeResult } as const)
        : undefined,
  }) as const;

const view = (s: GameState): View =>
  ({
    playerCards: s.playerCards,
    currentPlayerIndex: s.currentPlayerIndex,
    phase:
      s.type === 'toss.selecting' || s.type === 'toss.confirming'
        ? ('toss' as const)
        : s.type === 'judging.pending' || s.type === 'judging.shown'
          ? s.round
          : s.type === 'first.selecting' || s.type === 'first.answering'
            ? ('first' as const)
            : ('cont' as const),
    cardChosenToToss: chosenCards(s).cardChosenToToss,
    cardChosenToAttack: chosenCards(s).cardChosenToAttack,
    cardChosenToBeAttacked: chosenCards(s).cardChosenToBeAttacked,
    tossBalloon: s.type === 'toss.confirming' ? s.cardChosenToToss : undefined,
    answerBalloon:
      s.type === 'first.answering' || s.type === 'cont.answering'
        ? ({ answer: s.answerSelected } as const)
        : undefined,
    decidedBalloon:
      s.type === 'judging.pending'
        ? ({ answer: s.answerSelected, judgeResult: undefined } as const)
        : s.type === 'judging.shown'
          ? ({ answer: s.answerSelected, judgeResult: s.judgeResult } as const)
          : undefined,
  }) as const;

const legacyInitialState: LegacyGameState = {
  playerCards: initialGameState.playerCards,
  cardChosenToToss: undefined,
  cardChosenToAttack: undefined,
  cardChosenToBeAttacked: undefined,
  answerSelected: undefined,
  confirmTossBalloonIsOpen: false,
  selectAnswerBalloonIsOpen: false,
  decidedAnswerBalloonIsOpen: false,
  judgeOnDecidedAnswerIsOpen: false,
  judgeResult: undefined,
  readonly: false,
  currentPlayerIndex: initialGameState.currentPlayerIndex,
  phase: 'ph010_selectMyCardToToss',
} as const;

/** A seeded generator, so that a failing walk replays. */
const mulberry32 = (seed: number): (() => number) => {
  let mut_a = seed;

  return () => {
    mut_a = Math.trunc(mut_a + 0x6d_2b_79_f5);

    let mut_t = Math.imul(mut_a ^ (mut_a >>> 15), 1 | mut_a);

    mut_t ^= mut_t + Math.imul(mut_t ^ (mut_t >>> 7), 61 | mut_t);

    return ((mut_t ^ (mut_t >>> 14)) >>> 0) / 4_294_967_296;
  };
};

// The reducer before the graph.

type LegacyPhaseInTurn =
  'ph010_selectMyCardToToss' | 'ph020_firstAnswer' | 'ph030_continuousAnswer';

type LegacyGameState = Readonly<{
  playerCards: FixedLengthTuple<4, FixedLengthTuple<6, CardWithVisibility>>;

  // attack and answer
  cardChosenToToss: Card | undefined;
  cardChosenToAttack: Card | undefined;
  cardChosenToBeAttacked: Card | undefined;
  answerSelected: Card | undefined;
  confirmTossBalloonIsOpen: boolean;
  selectAnswerBalloonIsOpen: boolean;
  decidedAnswerBalloonIsOpen: boolean;
  judgeOnDecidedAnswerIsOpen: boolean;
  judgeResult: 'o' | 'x' | undefined;
  readonly: boolean;

  // turn and phase
  currentPlayerIndex: PlayerIndex;
  phase: LegacyPhaseInTurn;
}>;

type MutableLegacyGameState = DeepMutable<LegacyGameState>;

const answerSelectedReducer = (
  curr: Card | undefined,
  action: GameStateAction,
): Card | undefined => {
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

const cardChosenToAttackReducer = (
  curr: Card | undefined,
  action: GameStateAction,
): Card | undefined => {
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

const cardChosenToBeAttackedReducer = (
  curr: Card | undefined,
  action: GameStateAction,
): Card | undefined => {
  switch (action.type) {
    case 'selectOpponentCard':
      return cardEq(curr, action.card) ? undefined : action.card;
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
    case 'selectAnswer':
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
      return curr;
    case 'cancelAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'goToNextTurn':
      return undefined;
  }
};

const cardChosenToTossReducer = (
  curr: Card | undefined,
  action: GameStateAction,
): Card | undefined => {
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

const confirmTossBalloonIsOpenReducer = (
  curr: boolean,
  action: GameStateAction,
): boolean => {
  switch (action.type) {
    case 'selectMyCard':
      return true;
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
      return curr;
    case 'cancelToss':
    case 'submitToss':
    case 'goToNextTurn':
      return false;
  }
};

const readonlyReducer = (curr: boolean, action: GameStateAction): boolean => {
  switch (action.type) {
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'cancelAnswer':
      return curr;
    case 'goToNextTurn':
    case 'hideDecidedAnswerBalloon':
      return false;
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
      return true;
  }
};

const decidedAnswerBalloonIsOpenReducer = (
  curr: boolean,
  action: GameStateAction,
): boolean => {
  switch (action.type) {
    case 'submitAnswer':
      return true;
    case 'showJudgeOnDecidedAnswer':
    case 'cancelToss':
    case 'submitToss':
      return curr;
    case 'selectOpponentCard':
    case 'selectAnswer':
    case 'selectMyCard':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'goToNextTurn':
      return false;
  }
};

const selectAnswerBalloonIsOpenReducer = (
  curr: boolean,
  action: GameStateAction,
): boolean => {
  switch (action.type) {
    case 'selectOpponentCard':
      return true;
    case 'selectAnswer':
    case 'selectMyCard':
    case 'cancelToss':
    case 'submitToss':
      return curr;
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'goToNextTurn':
      return false;
  }
};

const faceUpCard = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_draft: MutableLegacyGameState,
  target: Card | undefined,
): void => {
  for (const mut_cards of mut_draft.playerCards) {
    for (const mut_c of mut_cards) {
      if (cardEq(mut_c, target)) {
        mut_c.visibleTo = 'everyone';
      }
    }
  }
};

const tossCard = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_draft: MutableLegacyGameState,
  target: Card | undefined,
): void => {
  for (const mut_cards of mut_draft.playerCards) {
    for (const mut_c of mut_cards) {
      if (cardEq(mut_c, target)) {
        mut_c.visibleTo = 'pair';
      }
    }
  }
};

const goToNextTurn = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  mut_draft: MutableLegacyGameState,
): void => {
  mut_draft.currentPlayerIndex = incrementPlayerIndex(
    mut_draft.currentPlayerIndex,
    1,
  );

  mut_draft.phase = 'ph010_selectMyCardToToss';

  mut_draft.decidedAnswerBalloonIsOpen = false;

  mut_draft.judgeOnDecidedAnswerIsOpen = false;
};

const legacyGameStateReducer = (
  state: LegacyGameState,
  action: GameStateAction,
): LegacyGameState =>
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
          return;
        }

        if (mut_draft.cardChosenToBeAttacked === undefined) {
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
