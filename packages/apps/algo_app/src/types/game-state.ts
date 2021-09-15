import { assertType } from '@noshiro/ts-utils';
import type { Card, CardWithVisibility } from './card-type';
import type { PhaseInTurn } from './phase-in-turn';
import type { PlayerIndex } from './player-index';

export type GameStateAction = Readonly<
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  | { type: 'selectMyCard'; card: Card }
  | { type: 'cancelToss' }
  | { type: 'submitToss' }
  | { type: 'selectOpponentCard'; card: Card }
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
  phase: PhaseInTurn;
}>;
