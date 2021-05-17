import type { ReadonlyArrayOfLength } from '@noshiro/ts-utils';
import type { Card, CardWithVisibility, PlayerIndex } from '../types';
import type { PhaseInTurn } from './phase-reducer';

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
