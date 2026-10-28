/**
 * The page's state, made once with the browser and Firestore as its
 * surroundings. What each part does, and the tests of it, are in the modules
 * this puts together — this file is only which real thing each is handed.
 */

import { counter } from 'synstate';
import { createFirestoreRoomApi } from '../api/index.mjs';
import { firebaseConfig } from '../constants/index.mjs';
import { createDisplayStore } from './display-store.mjs';
import { createGameStateStore } from './game-state-store.mjs';
import { createPositionStore } from './position-store.mjs';
import { createRoomStore } from './room-store.mjs';

const roomApi = createFirestoreRoomApi(firebaseConfig);

export const roomStore = createRoomStore({ api: roomApi });

export const gameStateStore = createGameStateStore({
  room: roomStore.room,
  actionsFromDb: roomStore.actionsFromDb,
  addAction: roomApi.addAction,
  setTimer: (delayMs, run) => {
    const timer = setTimeout(run, delayMs);

    return () => {
      clearTimeout(timer);
    };
  },
  counter: (ms) => counter(ms),
});

export const positionStore = createPositionStore();

export const displayStore = createDisplayStore({
  room: roomStore.room,
  myName: roomStore.myName,
  gameState: gameStateStore.gameState,
  onCardClick: gameStateStore.onCardClick,
  onTossCancel: gameStateStore.onTossCancel,
  onTossSubmit: gameStateStore.onTossSubmit,
  onSelectAnswer: gameStateStore.onSelectAnswer,
  onAnswerCancel: gameStateStore.onAnswerCancel,
  onAnswerSubmit: gameStateStore.onAnswerSubmit,
  cardPositions: positionStore.cardPositions,
  playerNamePositions: positionStore.playerNamePositions,
});

/**
 * Starts watching the room, writing the actions played here and the auto
 * play. Called once, from `main.tsx`, before the first render.
 */
export const startStore = (): (() => void) => {
  const stopRoom = roomStore.start();

  const stopGameState = gameStateStore.start();

  return () => {
    stopRoom();

    stopGameState();
  };
};
