import { Timestamp } from 'firebase/firestore';
import { toMermaid } from 'ts-fsm-forge';
import { cardEq, incrementPlayerIndex } from '../functions/index.mjs';
import type { Card, GameState, GameStateAction } from '../types/index.mjs';
import { answerToSubmit, gameStateMachine } from './game-state-machine.mjs';
import { initialGameState } from './initial-game-state.mjs';

describe('gameStateMachine', () => {
  const { reducer } = gameStateMachine;

  test('a change of target clears the answer given for the previous one', () => {
    const answering = play(
      firstSelecting,
      selectMyCard(attackCard),
      selectOpponentCard(targetA),
      selectAnswer(targetA),
    );

    assert.strictEqual(answering.type, 'first.answering');

    const switched = reducer(answering, selectOpponentCard(targetB));

    assert.isTrue(switched.type === 'first.answering');

    assert.deepStrictEqual(switched.cardChosenToBeAttacked, targetB);

    assert.isUndefined(switched.answerSelected);
  });

  test('unselecting the target and choosing another starts with no answer', () => {
    const state = play(
      firstSelecting,
      selectMyCard(attackCard),
      selectOpponentCard(targetA),
      selectAnswer(targetA),
      selectOpponentCard(targetA),
      selectOpponentCard(targetB),
    );

    assert.isTrue(state.type === 'first.answering');

    assert.isUndefined(state.answerSelected);
  });

  test('an answer cannot be submitted before one is selected', () => {
    const noAnswer = play(
      firstSelecting,
      selectMyCard(attackCard),
      selectOpponentCard(targetA),
    );

    assert.isUndefined(answerToSubmit(noAnswer));

    assert.strictEqual(reducer(noAnswer, submitAnswer()), noAnswer);
  });

  test('an answer cannot be submitted before the card to attack with is chosen', () => {
    const noAttack = play(
      firstSelecting,
      selectOpponentCard(targetA),
      selectAnswer(targetA),
    );

    assert.isUndefined(answerToSubmit(noAttack));

    assert.strictEqual(reducer(noAttack, submitAnswer()), noAttack);
  });

  test('a right answer turns the attacked card face up and attacks again', () => {
    const state = play(
      firstSelecting,
      selectMyCard(attackCard),
      selectOpponentCard(targetA),
      selectAnswer(targetA),
      submitAnswer(),
      showJudge(),
    );

    assert.isTrue(state.type === 'judging.shown');

    assert.strictEqual(state.judgeResult, 'o');

    assert.strictEqual(visibilityOf(state, targetA), 'everyone');

    const next = reducer(state, hideBalloon());

    assert.deepStrictEqual(next, {
      type: 'cont.selecting',
      playerCards: state.playerCards,
      currentPlayerIndex: state.currentPlayerIndex,
      cardChosenToAttack: attackCard,
    });
  });

  test('a wrong answer turns the attacking card face up and ends the turn', () => {
    const state = play(
      firstSelecting,
      selectMyCard(attackCard),
      selectOpponentCard(targetA),
      selectAnswer({ color: 'white', number: 5 }),
      submitAnswer(),
      showJudge(),
      hideBalloon(),
    );

    assert.strictEqual(visibilityOf(state, attackCard), 'everyone');

    assert.deepStrictEqual(state, {
      type: 'toss.selecting',
      playerCards: state.playerCards,
      currentPlayerIndex: incrementPlayerIndex(
        firstSelecting.currentPlayerIndex,
        1,
      ),
    });
  });

  test('an action out of place, as a log may replay it, changes nothing', () => {
    assert.strictEqual(
      reducer(initialGameState, selectOpponentCard(targetA)),
      initialGameState,
    );

    assert.strictEqual(
      reducer(initialGameState, goToNextTurn()),
      initialGameState,
    );

    assert.strictEqual(
      reducer(initialGameState, showJudge()),
      initialGameState,
    );
  });

  test('the graph', () => {
    assert.strictEqual(
      toMermaid(gameStateMachine.graph, { initial: 'toss.selecting' }),
      [
        'stateDiagram-v2',
        '  state "toss.selecting" as s0',
        '  state "toss.confirming" as s1',
        '  state "first.selecting" as s2',
        '  state "first.answering" as s3',
        '  state "cont.selecting" as s4',
        '  state "cont.answering" as s5',
        '  state "judging.pending" as s6',
        '  state "judging.shown" as s7',
        '  [*] --> s0',
        '  s0 --> s1: selectMyCard',
        '  s1 --> s0: selectMyCard',
        '  s1 --> s1: selectMyCard',
        '  s1 --> s0: cancelToss',
        '  s1 --> s2: submitToss',
        '  s2 --> s2: selectMyCard',
        '  s2 --> s3: selectOpponentCard',
        '  s3 --> s3: selectMyCard',
        '  s3 --> s2: selectOpponentCard',
        '  s3 --> s3: selectOpponentCard',
        '  s3 --> s3: selectAnswer',
        '  s3 --> s2: cancelAnswer',
        '  s3 --> s6: submitAnswer',
        '  s3 --> s3: submitAnswer',
        '  s4 --> s5: selectOpponentCard',
        '  s4 --> s0: goToNextTurn',
        '  s5 --> s4: selectOpponentCard',
        '  s5 --> s5: selectOpponentCard',
        '  s5 --> s5: selectAnswer',
        '  s5 --> s4: cancelAnswer',
        '  s5 --> s6: submitAnswer',
        '  s5 --> s5: submitAnswer',
        '  s5 --> s0: goToNextTurn',
        '  s6 --> s7: showJudgeOnDecidedAnswer',
        '  s7 --> s0: hideDecidedAnswerBalloon',
        '  s7 --> s4: hideDecidedAnswerBalloon',
      ].join('\n'),
    );
  });
});

const ts = Timestamp.fromMillis(0);

const selectMyCard = (card: Card): GameStateAction =>
  ({ type: 'selectMyCard', timestamp: ts, card }) as const;

const selectOpponentCard = (card: Card): GameStateAction =>
  ({ type: 'selectOpponentCard', timestamp: ts, card }) as const;

const selectAnswer = (answer: Card): GameStateAction =>
  ({ type: 'selectAnswer', timestamp: ts, answer }) as const;

const submitAnswer = (): GameStateAction =>
  ({ type: 'submitAnswer', timestamp: ts }) as const;

const showJudge = (): GameStateAction =>
  ({ type: 'showJudgeOnDecidedAnswer', timestamp: ts }) as const;

const hideBalloon = (): GameStateAction =>
  ({ type: 'hideDecidedAnswerBalloon', timestamp: ts }) as const;

const goToNextTurn = (): GameStateAction =>
  ({ type: 'goToNextTurn', timestamp: ts }) as const;

const play = (
  state: GameState,
  ...actions: readonly GameStateAction[]
): GameState => actions.reduce(gameStateMachine.reducer, state);

// Player 1 opens; the players on either side are 2 and 0.
const tossCard: Card = { color: 'black', number: 6 } as const;

const attackCard: Card = { color: 'white', number: 7 } as const;

// Two of player 2's cards.
const targetA: Card = { color: 'white', number: 4 } as const;

const targetB: Card = { color: 'black', number: 8 } as const;

const firstSelecting: GameState = play(
  initialGameState,
  selectMyCard(tossCard),
  { type: 'submitToss', timestamp: ts },
);

const visibilityOf = (state: GameState, card: Card): string | undefined =>
  state.playerCards.flat().find((c) => cardEq(c, card))?.visibleTo;
