/**
 * What the page draws, read off the game, the room, this player and where
 * things are on the screen. Nothing here is written; it is all derived.
 */

import { combine, map, type InitializedObservable } from 'synstate';
import type { StrictPick } from 'ts-type-forge';
import type { Rect } from 'ts-utils-additional';
import { getCardDirection } from '../functions/index.mjs';
import { mapToDisplayValue } from '../state/index.mjs';
import type {
  CardNumber,
  ConfirmTossBalloonProps,
  DecidedAnswerBalloonProps,
  DisplayValues,
  PlayerIndex,
  SelectAnswerBalloonProps,
} from '../types/index.mjs';
import type { GameStateStore } from './game-state-store.mjs';
import type { PositionStore } from './position-store.mjs';
import type { RoomStore } from './room-store.mjs';

export type DisplayDeps = Readonly<
  StrictPick<RoomStore, 'myName' | 'room'> &
    StrictPick<
      GameStateStore,
      | 'gameState'
      | 'onAnswerCancel'
      | 'onAnswerSubmit'
      | 'onCardClick'
      | 'onSelectAnswer'
      | 'onTossCancel'
      | 'onTossSubmit'
    > &
    StrictPick<PositionStore, 'cardPositions' | 'playerNamePositions'>
>;

export type DisplayStore = Readonly<{
  myPlayerIndex: InitializedObservable<PlayerIndex | undefined>;
  displayValues: InitializedObservable<DisplayValues>;
  turnPlayerHighlighterPosition: InitializedObservable<Rect | undefined>;
  confirmTossBalloonProps: InitializedObservable<
    ConfirmTossBalloonProps | undefined
  >;
  selectAnswerBalloonProps: InitializedObservable<
    SelectAnswerBalloonProps | undefined
  >;
  decidedAnswerBalloonProps: InitializedObservable<
    DecidedAnswerBalloonProps | undefined
  >;
}>;

export const createDisplayStore = (deps: DisplayDeps): DisplayStore => {
  const myPlayerIndex: InitializedObservable<PlayerIndex | undefined> = combine(
    [deps.room, deps.myName],
  ).pipe(
    map(([room, myName]) => {
      if (room === undefined || myName === undefined) {
        return undefined;
      }

      const index: number = room.players.findIndex((p) => p.name === myName);

      if (index === 0 || index === 1 || index === 2 || index === 3) {
        return index;
      }

      console.warn(
        `myName should be one of { 0, 1, 2, 3 }. result is "${index}". `,
      );

      return undefined;
    }),
  );

  const isMyTurn: InitializedObservable<boolean> = combine([
    deps.gameState,
    myPlayerIndex,
  ]).pipe(
    map(
      ([gameState, playerIndex]) =>
        gameState.currentPlayerIndex === playerIndex,
    ),
  );

  const displayValues: InitializedObservable<DisplayValues> = combine([
    deps.gameState,
    myPlayerIndex,
  ]).pipe(
    map(([gameState, playerIndex]) =>
      mapToDisplayValue({
        gameState,
        myPlayerIndex: playerIndex ?? 0,
        onCardClick: deps.onCardClick,
      }),
    ),
  );

  const turnPlayerHighlighterPosition = combine([
    deps.playerNamePositions,
    displayValues,
  ]).pipe(map(([namePositions, values]) => namePositions?.[values.turnPlayer]));

  const confirmTossBalloonProps: InitializedObservable<
    ConfirmTossBalloonProps | undefined
  > = combine([isMyTurn, deps.gameState, deps.cardPositions]).pipe(
    map(([myTurn, gameState, cardPositions]) => {
      if (!myTurn) {
        return undefined;
      }

      if (!gameState.confirmTossBalloonIsOpen) {
        return undefined;
      }

      if (cardPositions === undefined) {
        return undefined;
      }

      const anchorCard = gameState.cardChosenToToss;

      if (anchorCard === undefined) {
        return undefined;
      }

      return {
        anchorCardRect: cardPositions[anchorCard.color][anchorCard.number],
        card: anchorCard,
        cancel: () => {
          deps.onTossCancel();
        },
        submit: () => {
          deps.onTossSubmit();
        },
      };
    }),
  );

  const selectAnswerBalloonProps: InitializedObservable<
    SelectAnswerBalloonProps | undefined
  > = combine([
    isMyTurn,
    deps.gameState,
    deps.cardPositions,
    displayValues,
  ]).pipe(
    map(([myTurn, gameState, cardPositions, values]) => {
      if (!myTurn) {
        return undefined;
      }

      if (!gameState.selectAnswerBalloonIsOpen) {
        return undefined;
      }

      if (cardPositions === undefined) {
        return undefined;
      }

      const anchorCard = gameState.cardChosenToBeAttacked;

      if (anchorCard === undefined) {
        return undefined;
      }

      const cardColor = anchorCard.color;

      return {
        anchorCardRect: cardPositions[anchorCard.color][anchorCard.number],
        arrowDirection: getCardDirection(values.playerCards, anchorCard),
        cardColor,
        onCancelClick: deps.onAnswerCancel,
        submitAnswer: deps.onAnswerSubmit,
        selectedNumber: gameState.answerSelected?.number,
        onSelectedNumberChange: (selectedNumber: CardNumber) => {
          deps.onSelectAnswer({ color: cardColor, number: selectedNumber });
        },
        submitButtonIsDisabled:
          gameState.cardChosenToAttack === undefined ||
          gameState.cardChosenToBeAttacked === undefined,
      };
    }),
  );

  const decidedAnswerBalloonProps: InitializedObservable<
    DecidedAnswerBalloonProps | undefined
  > = combine([deps.cardPositions, deps.gameState, displayValues]).pipe(
    map(([cardPositions, gameState, values]) => {
      if (cardPositions === undefined) {
        return undefined;
      }

      if (!gameState.decidedAnswerBalloonIsOpen) {
        return undefined;
      }

      if (gameState.answerSelected === undefined) {
        return undefined;
      }

      const anchorCard = gameState.cardChosenToBeAttacked;

      if (anchorCard === undefined) {
        return undefined;
      }

      return {
        anchorCardRect: cardPositions[anchorCard.color][anchorCard.number],
        arrowDirection: getCardDirection(values.playerCards, anchorCard),
        card: gameState.answerSelected,
        showSymbol: gameState.judgeResult,
      };
    }),
  );

  return {
    myPlayerIndex,
    displayValues,
    turnPlayerHighlighterPosition,
    confirmTossBalloonProps,
    selectAnswerBalloonProps,
    decidedAnswerBalloonProps,
  };
};
