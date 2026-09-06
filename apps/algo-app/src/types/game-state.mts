import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type FixedLengthTuple } from 'ts-type-forge';
import {
  cardWithVisibilityTypeDef,
  type Card,
  type CardWithVisibility,
} from './card-type.mjs';
import { type PhaseInTurn } from './phase-in-turn.mjs';
import { type PlayerIndex } from './player-index.mjs';

export const playerCardsTypeDef = t.fixedLengthTuple(
  4,
  t.fixedLengthTuple(6, cardWithVisibilityTypeDef),
);

type PlayerCards = t.TypeOf<typeof playerCardsTypeDef>;

expectType<
  PlayerCards,
  FixedLengthTuple<4, FixedLengthTuple<6, CardWithVisibility>>
>('<=');

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
