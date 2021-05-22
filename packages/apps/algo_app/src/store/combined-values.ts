import type { InitializedObservable } from '@noshiro/syncflow';
import { combineLatestI, mapI } from '@noshiro/syncflow';
import { getCardDirection } from '../functions';
import { mapToDisplayValue } from '../state';
import type {
  CardNumber,
  DecidedAnswerBalloonProps,
  DisplayValues,
  SelectAnswerBalloonProps,
} from '../types';
import {
  onAnswerCancel,
  onAnswerSubmit,
  onCardClick,
  onSelectAnswer,
} from './action';
import { gameState$ } from './game-state';
import { myPlayerIndex$ } from './my-player-index';
import { cardPositions$, playerNamePositions$ } from './position';

export const displayValues$: InitializedObservable<DisplayValues> =
  combineLatestI(gameState$, myPlayerIndex$).chain(
    mapI(([gameState, myPlayerIndex]) =>
      mapToDisplayValue({ gameState, myPlayerIndex, onCardClick })
    )
  );

export const turnPlayerHighlighterPosition$ = combineLatestI(
  playerNamePositions$,
  displayValues$
).chain(
  mapI(([playerNamePositions, displayValues]) =>
    playerNamePositions === undefined
      ? undefined
      : playerNamePositions[displayValues.turnPlayer]
  )
);

export const selectAnswerBalloonProps$: InitializedObservable<
  SelectAnswerBalloonProps | undefined
> = combineLatestI(gameState$, cardPositions$, displayValues$).chain(
  mapI(([gameState, cardPositions, displayValues]) => {
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
> = combineLatestI(gameState$, cardPositions$, displayValues$).chain(
  mapI(([gameState, cardPositions, displayValues]) => {
    if (!gameState.decidedAnswerBalloonIsOpen) return undefined;
    if (cardPositions === undefined) return undefined;
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
