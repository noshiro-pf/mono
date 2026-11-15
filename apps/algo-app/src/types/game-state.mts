import type { FixedLengthTuple, MergeIntersection } from 'ts-type-forge';
import type { Card, CardWithVisibility } from './card-type.mjs';
import type { PlayerIndex } from './player-index.mjs';

/**
 * The game: the table, and where the current player's turn is. Which actions
 * each state takes, and where they lead, is the graph of `gameStateMachine`
 * (`state/game-state-machine.mts`).
 *
 * A turn starts by tossing a card to the partner (`toss.*`), then attacks an
 * opponent card with one of the player's own (`first.*`). A right answer turns
 * the attacked card face up and lets the player attack again with the same card
 * (`cont.*`), or end the turn; a wrong one turns the attacking card face up and
 * ends the turn. `*.selecting` is choosing the cards, `*.answering` has the
 * answer balloon open at the card attacked, and `judging.*` shows the answer
 * submitted, then whether it was right.
 */
export type GameState =
  | TurnState<'toss.selecting'>
  | TurnState<'toss.confirming', Readonly<{ cardChosenToToss: Card }>>
  | TurnState<
      'first.selecting',
      Readonly<{ cardChosenToAttack: Card | undefined }>
    >
  | TurnState<
      'first.answering',
      Readonly<{
        cardChosenToAttack: Card | undefined;
        cardChosenToBeAttacked: Card;
        answerSelected: Card | undefined;
      }>
    >
  | TurnState<'cont.selecting', Readonly<{ cardChosenToAttack: Card }>>
  | TurnState<
      'cont.answering',
      Readonly<{
        cardChosenToAttack: Card;
        cardChosenToBeAttacked: Card;
        answerSelected: Card | undefined;
      }>
    >
  | TurnState<'judging.pending', Judging>
  | TurnState<
      'judging.shown',
      MergeIntersection<Judging & Readonly<{ judgeResult: 'o' | 'x' }>>
    >;

/** The attack the answer belongs to: the first of the turn, or one after it. */
export type AttackRound = 'cont' | 'first';

type PlayerCards = FixedLengthTuple<4, FixedLengthTuple<6, CardWithVisibility>>;

type TurnState<T extends string, Fields = unknown> = MergeIntersection<
  Readonly<
    {
      type: T;
      playerCards: PlayerCards;
      currentPlayerIndex: PlayerIndex;
    } & Fields
  >
>;

type Judging = Readonly<{
  round: AttackRound;
  cardChosenToAttack: Card;
  cardChosenToBeAttacked: Card;
  answerSelected: Card;
}>;
