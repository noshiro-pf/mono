import type { Card, GameState } from '../types/index.mjs';

export type ChosenCards = Readonly<{
  cardChosenToToss: Card | undefined;
  cardChosenToAttack: Card | undefined;
  cardChosenToBeAttacked: Card | undefined;
}>;

/** The cards the state has chosen, which the table draws raised or outlined. */
export const chosenCards = (gameState: GameState): ChosenCards => {
  switch (gameState.type) {
    case 'toss.selecting':
      return none;

    case 'toss.confirming':
      return { ...none, cardChosenToToss: gameState.cardChosenToToss };

    case 'first.selecting':
    case 'cont.selecting':
      return { ...none, cardChosenToAttack: gameState.cardChosenToAttack };

    case 'first.answering':
    case 'cont.answering':
    case 'judging.pending':
    case 'judging.shown':
      return {
        ...none,
        cardChosenToAttack: gameState.cardChosenToAttack,
        cardChosenToBeAttacked: gameState.cardChosenToBeAttacked,
      };
  }
};

const none: ChosenCards = {
  cardChosenToToss: undefined,
  cardChosenToAttack: undefined,
  cardChosenToBeAttacked: undefined,
} as const;
