import * as t from '@noshiro/io-ts';
import {
  cardWithVisibilityTypeDef,
  type Card,
  type CardWithVisibility,
} from './card-type';
import { type PhaseInTurn } from './phase-in-turn';
import { type PlayerIndex } from './player-index';

export const playerCardsTypeDef = t.arrayOfLength(
  4,
  t.arrayOfLength(6, cardWithVisibilityTypeDef),
);

type PlayerCards = t.TypeOf<typeof playerCardsTypeDef>;

expectType<PlayerCards, ArrayOfLength<4, ArrayOfLength<6, CardWithVisibility>>>(
  '<=',
);

export type GameState = Readonly<{
  playerCards: PlayerCards;

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
