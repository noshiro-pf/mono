import { type Card, type CardWithVisibility } from './card-type';
import { type PhaseInTurn } from './phase-in-turn';
import { type PlayerIndex } from './player-index';

export type GameState = Readonly<{
  playerCards: ArrayOfLength<4, ArrayOfLength<6, CardWithVisibility>>;

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
