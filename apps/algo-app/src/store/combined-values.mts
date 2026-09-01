import { combine, map, type InitializedObservable } from 'synstate';
import { getCardDirection } from '../functions/index.mjs';
import { mapToDisplayValue } from '../state/index.mjs';
import {
  type CardNumber,
  type ConfirmTossBalloonProps,
  type DecidedAnswerBalloonProps,
  type DisplayValues,
  type SelectAnswerBalloonProps,
} from '../types/index.mjs';
import {
  onAnswerCancel,
  onAnswerSubmit,
  onCardClick,
  onSelectAnswer,
  onTossCancel,
  onTossSubmit,
} from './action.mjs';
import { gameState$ } from './game-state.mjs';
import { myPlayerIndex$ } from './my-player-index.mjs';
import { cardPositions$, playerNamePositions$ } from './position/index.mjs';

const isMyTurn$: InitializedObservable<boolean> = combine([
  gameState$,
  myPlayerIndex$,
]).pipe(
  map(
    ([gameState, myPlayerIndex]) =>
      gameState.currentPlayerIndex === myPlayerIndex,
  ),
);

export const displayValues$: InitializedObservable<DisplayValues> = combine([
  gameState$,
  myPlayerIndex$,
]).pipe(
  map(([gameState, myPlayerIndex]) =>
    mapToDisplayValue({
      gameState,
      myPlayerIndex: myPlayerIndex ?? 0,
      onCardClick,
    }),
  ),
);

export const turnPlayerHighlighterPosition$ = combine([
  playerNamePositions$,
  displayValues$,
]).pipe(
  map(([playerNamePositions, displayValues]) =>
    playerNamePositions === undefined
      ? undefined
      : playerNamePositions[displayValues.turnPlayer],
  ),
);

export const confirmTossBalloonProps$: InitializedObservable<
  ConfirmTossBalloonProps | undefined
> = combine([isMyTurn$, gameState$, cardPositions$]).pipe(
  map(([isMyTurn, gameState, cardPositions]) => {
    if (!isMyTurn) return undefined;

    if (!gameState.confirmTossBalloonIsOpen) return undefined;

    if (cardPositions === undefined) return undefined;

    const anchorCard = gameState.cardChosenToToss;

    if (anchorCard === undefined) return undefined;

    return {
      anchorCardRect: cardPositions[anchorCard.color][anchorCard.number],
      card: anchorCard,
      cancel: () => {
        onTossCancel();
      },
      submit: () => {
        onTossSubmit();
      },
    };
  }),
);

export const selectAnswerBalloonProps$: InitializedObservable<
  SelectAnswerBalloonProps | undefined
> = combine([isMyTurn$, gameState$, cardPositions$, displayValues$]).pipe(
  map(([isMyTurn, gameState, cardPositions, displayValues]) => {
    if (!isMyTurn) return undefined;

    if (!gameState.selectAnswerBalloonIsOpen) return undefined;

    if (cardPositions === undefined) return undefined;

    const anchorCard = gameState.cardChosenToBeAttacked;

    if (anchorCard === undefined) return undefined;

    const cardColor = anchorCard.color;

    return {
      anchorCardRect: cardPositions[anchorCard.color][anchorCard.number],
      arrowDirection: getCardDirection(displayValues.playerCards, anchorCard),
      cardColor,
      onCancelClick: onAnswerCancel,
      submitAnswer: onAnswerSubmit,
      selectedNumber: gameState.answerSelected?.number,
      onSelectedNumberChange: (selectedNumber: CardNumber) => {
        onSelectAnswer({ color: cardColor, number: selectedNumber });
      },
      submitButtonIsDisabled:
        gameState.cardChosenToAttack === undefined ||
        gameState.cardChosenToBeAttacked === undefined,
    };
  }),
);

export const decidedAnswerBalloonProps$: InitializedObservable<
  DecidedAnswerBalloonProps | undefined
> = combine([cardPositions$, gameState$, displayValues$]).pipe(
  map(([cardPositions, gameState, displayValues]) => {
    if (cardPositions === undefined) return undefined;

    if (!gameState.decidedAnswerBalloonIsOpen) return undefined;

    if (gameState.answerSelected === undefined) return undefined;

    const anchorCard = gameState.cardChosenToBeAttacked;

    if (anchorCard === undefined) return undefined;

    return {
      anchorCardRect: cardPositions[anchorCard.color][anchorCard.number],
      arrowDirection: getCardDirection(displayValues.playerCards, anchorCard),
      card: gameState.answerSelected,
      showSymbol: gameState.judgeResult,
    };
  }),
);
