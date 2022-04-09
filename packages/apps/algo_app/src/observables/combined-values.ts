import { getCardDirection } from '../functions';
import { mapToDisplayValue } from '../state';
import type {
  CardNumber,
  ConfirmTossBalloonProps,
  DecidedAnswerBalloonProps,
  DisplayValues,
  SelectAnswerBalloonProps,
} from '../types';
import {
  onAnswerCancel,
  onAnswerSubmit,
  onCardClick,
  onSelectAnswer,
  onTossCancel,
  onTossSubmit,
} from './action';
import { gameState$ } from './game-state';
import { myPlayerIndex$ } from './my-player-index';
import { cardPositions$, playerNamePositions$ } from './position';

const isMyTurn$: InitializedObservable<boolean> = combineLatestI([
  gameState$,
  myPlayerIndex$,
] as const).chain(
  mapI(
    ([gameState, myPlayerIndex]) =>
      gameState.currentPlayerIndex === myPlayerIndex
  )
);

export const displayValues$: InitializedObservable<DisplayValues> =
  combineLatestI([gameState$, myPlayerIndex$] as const).chain(
    mapI(([gameState, myPlayerIndex]) =>
      mapToDisplayValue({
        gameState,
        myPlayerIndex: myPlayerIndex ?? 0,
        onCardClick,
      })
    )
  );

export const turnPlayerHighlighterPosition$ = combineLatestI([
  playerNamePositions$,
  displayValues$,
] as const).chain(
  mapI(([playerNamePositions, displayValues]) =>
    playerNamePositions === undefined
      ? undefined
      : playerNamePositions[displayValues.turnPlayer]
  )
);

export const confirmTossBalloonProps$: InitializedObservable<
  ConfirmTossBalloonProps | undefined
> = combineLatestI([isMyTurn$, gameState$, cardPositions$] as const).chain(
  mapI(([isMyTurn, gameState, cardPositions]) => {
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
  })
);

export const selectAnswerBalloonProps$: InitializedObservable<
  SelectAnswerBalloonProps | undefined
> = combineLatestI([
  isMyTurn$,
  gameState$,
  cardPositions$,
  displayValues$,
] as const).chain(
  mapI(([isMyTurn, gameState, cardPositions, displayValues]) => {
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
  })
);

export const decidedAnswerBalloonProps$: InitializedObservable<
  DecidedAnswerBalloonProps | undefined
> = combineLatestI([cardPositions$, gameState$, displayValues$] as const).chain(
  mapI(([cardPositions, gameState, displayValues]) => {
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
  })
);
