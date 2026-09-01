import { pairwise, scan, type InitializedObservable } from 'synstate';
import { returnFalse } from '../return-boolean.mjs';
import { gameStateReducer, initialGameState } from '../state/index.mjs';
import { type GameState } from '../types/index.mjs';
import { gameStateActionMerged$ } from './action.mjs';

export const gameState$: InitializedObservable<GameState> =
  gameStateActionMerged$.pipe(scan(gameStateReducer, initialGameState));

gameState$.pipe(pairwise()).subscribe(([prev, curr]) => {
  if (returnFalse()) {
    console.log('gameState$.prev', prev, 'gameState$.curr', curr);
  }
});
