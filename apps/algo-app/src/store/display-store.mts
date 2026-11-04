/**
 * What the page draws, read off the game, the room, this player and where
 * things are on the screen. Nothing here is written; it is all derived.
 */

import { combine, map, type InitializedObservable } from 'synstate';
import type { StrictPick } from 'ts-type-forge';
import type { Rect } from 'ts-utils-additional';
import { getCardDirection, getShuffledPlayers } from '../functions/index.mjs';
import { mapToDisplayValue } from '../state/index.mjs';
import {
  toShuffleDef,
  type CardNumber,
  type ConfirmTossBalloonProps,
  type DecidedAnswerBalloonProps,
  type DisplayValues,
  type PlayerIndex,
  type SelectAnswerBalloonProps,
} from '../types/index.mjs';
import type { GameStateStore } from './game-state-store.mjs';
import type { PositionStore } from './position-store.mjs';
import type { RoomStore } from './room-store.mjs';

export type DisplayDeps = Readonly<
  StrictPick<RoomStore, 'myPlayerId' | 'players' | 'room'> &
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
  // The seat this player is in: its place among the players as the room's
  // `shuffleDef` seats them, not the order they joined in.
  const myPlayerIndex: InitializedObservable<PlayerIndex | undefined> = combine(
    [deps.room, deps.players, deps.myPlayerId],
  ).pipe(
    map(([room, players, myPlayerId]) => {
      if (room === undefined || myPlayerId === undefined) {
        return undefined;
      }

      const index: number = getShuffledPlayers(
        players,
        room.shuffleDef,
      ).findIndex((p) => p?.id === myPlayerId);

      // Not seated also while the players are still being read.
      return index === 0 || index === 1 || index === 2 || index === 3
        ? index
        : undefined;
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
    deps.room,
    deps.players,
    myPlayerIndex,
  ]).pipe(
    map(([gameState, room, players, playerIndex]) =>
      mapToDisplayValue({
        roomState: room?.state ?? 'not-started',
        gameState,
        shuffleDef: room?.shuffleDef ?? toShuffleDef('0123'),
        players,
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
