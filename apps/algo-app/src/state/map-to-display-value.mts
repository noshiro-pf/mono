import { Arr, match } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  dictionary,
  directions,
  outlineColorDef,
} from '../constants/index.mjs';
import {
  cardEq,
  decrementPlayerIndex,
  incrementPlayerIndex,
  sortCards,
} from '../functions/index.mjs';
import type {
  Card,
  CardWithDisplayValue,
  CardWithVisibility,
  DisplayValues,
  GameState,
  NWES,
  PlayerIndex,
  VisibilityFromMe,
} from '../types/index.mjs';
import { chosenCards } from './chosen-cards.mjs';
import { gameStateMachine } from './game-state-machine.mjs';

export const mapToDisplayValue = ({
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  gameState: GameState;
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
}>): DisplayValues =>
  ({
    playerCards: {
      S: mapPlayers6CardsToDisplayValue({
        direction: 'S',
        player6Cards: gameState.playerCards[myPlayerIndex],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      W: mapPlayers6CardsToDisplayValue({
        direction: 'W',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 1)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      N: mapPlayers6CardsToDisplayValue({
        direction: 'N',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 2)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      E: mapPlayers6CardsToDisplayValue({
        direction: 'E',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 3)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
    },

    gameMessage: gameMessage(gameState),
    // Every branch of the original `match` was the same expression with the
    // matched value substituted, so it collapses to one call. `match` also
    // requires string cases now, and `currentPlayerIndex` is numeric.
    turnPlayer:
      directions[
        decrementPlayerIndex(gameState.currentPlayerIndex, myPlayerIndex)
      ],

    endTurnButtonDisabled: !gameStateMachine.can(gameState, 'goToNextTurn'),
  }) as const;

const mapPlayers6CardsToDisplayValue = ({
  direction,
  player6Cards,
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  direction: NWES;
  player6Cards: FixedLengthTuple<6, CardWithVisibility>;
  gameState: GameState;
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
}>): FixedLengthTuple<6, CardWithDisplayValue> => {
  const { cardChosenToToss, cardChosenToAttack, cardChosenToBeAttacked } =
    chosenCards(gameState);

  // Written as `Arr.map(sortCards(…), …)` rather than `pipe().map(Arr.map(…))`:
  // `fix:lint` rewrites the latter into `Arr.map`'s curried overload, which
  // cannot infer the element type from the callback alone and leaves every
  // parameter `unknown`.
  return Arr.map(sortCards(player6Cards), (c) => {
    const isAns = cardEq(cardChosenToBeAttacked, c);

    const isAtk = cardEq(cardChosenToAttack, c);

    const isToss = cardEq(cardChosenToToss, c);

    const visibilityFromMe: VisibilityFromMe = match(c.visibleTo, {
      self: 'faceDown',
      pair: match(direction, {
        S: 'faceDownButVisibleToMe',
        W: 'faceDownButVisibleToCounter',
        N: 'faceDownButVisibleToMe',
        E: 'faceDownButVisibleToCounter',
      } as const),
      everyone: 'faceUp',
    } as const);

    // What a click sends is decided by the side of the table the card is on;
    // the graph says whether the turn takes it now.
    const isClickable: boolean =
      myPlayerIndex === gameState.currentPlayerIndex &&
      visibilityFromMe !== 'faceUp' &&
      match(direction, {
        S: gameStateMachine.can(gameState, 'selectMyCard'),
        W: gameStateMachine.can(gameState, 'selectOpponentCard'),
        N: false,
        E: gameStateMachine.can(gameState, 'selectOpponentCard'),
      } as const);

    return {
      ...c,
      visibilityFromMe,
      isClickable,
      float: isAtk || isToss ? 'always' : 'never',
      showOutline: match(direction, {
        S: isAtk || isToss ? 'always' : isClickable ? 'onHover' : 'never',
        W: isAns ? 'always' : isClickable ? 'onHover' : 'never',
        N: 'never',
        E: isAns ? 'always' : isClickable ? 'onHover' : 'never',
      } as const),
      outlineColor:
        isAns || isAtk || isToss ? outlineColorDef.red : outlineColorDef.green,
      onClick: !isClickable
        ? () => undefined
        : () => {
            onCardClick(c, direction);
          },
    } as const;
  });
};

const gameMessage = (gameState: GameState): string => {
  switch (gameState.type) {
    case 'toss.selecting':
    case 'toss.confirming':
      return dictionary.gameMessage.selectYourCardToToss;

    case 'first.selecting':
    case 'first.answering':
      return dictionary.gameMessage.selectYourCardAndAttack;

    case 'cont.selecting':
    case 'cont.answering':
      return dictionary.gameMessage.selectYourCardToAttack;

    case 'judging.pending':
    case 'judging.shown':
      return gameState.round === 'first'
        ? dictionary.gameMessage.selectYourCardAndAttack
        : dictionary.gameMessage.selectYourCardToAttack;
  }
};
