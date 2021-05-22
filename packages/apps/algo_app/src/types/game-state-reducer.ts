/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { ReadonlyArrayOfLength, TypeExtends } from '@noshiro/ts-utils';
import { assertType } from '@noshiro/ts-utils';
import type { Card, CardWithVisibility } from './card-type';
import type { PhaseInTurn } from './phase-in-turn';
import type { PlayerIndex } from './player-index';

export type GameStateAction = Readonly<
  | { type: 'selectAttackCard'; card: Card }
  | { type: 'selectCardToAnswer'; card: Card }
  | { type: 'selectAnswer'; answer: Card }
  | { type: 'cancelAnswer' }
  | { type: 'submitAnswer' }
  | { type: 'showJudgeOnDecidedAnswer' }
  | { type: 'hideDecidedAnswerBalloon' }
  | { type: 'goToNextTurn' }
>;

assertType<TypeExtends<GameStateAction, Readonly<{ type: string }>>>();

export type GameState = Readonly<{
  playerCards: ReadonlyArrayOfLength<
    4,
    ReadonlyArrayOfLength<6, CardWithVisibility>
  >;

  // attack and answer
  cardChosenToAttack: Card | undefined;
  cardChosenToBeAttacked: Card | undefined;
  answerSelected: Card | undefined;
  selectAnswerBalloonIsOpen: boolean;
  decidedAnswerBalloonIsOpen: boolean;
  judgeOnDecidedAnswerIsOpen: boolean;
  judgeResult: 'o' | 'x' | undefined;

  // turn and phase
  currentPlayerIndex: PlayerIndex;
  phase: PhaseInTurn;
}>;
