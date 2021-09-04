import type { InitializedObservable } from '@noshiro/syncflow';
import { pairwise, scan } from '@noshiro/syncflow';
import { returnFalse } from '../return-boolean';
import { gameStateReducer, initialGameState } from '../state';
import type { GameState } from '../types';
import { gameStateAction$ } from './action';

export const gameState$: InitializedObservable<GameState> =
  gameStateAction$.chain(scan(gameStateReducer, initialGameState));

gameState$.chain(pairwise()).subscribe(([prev, curr]) => {
  if (returnFalse()) {
    console.log('gameState$.prev', prev, 'gameState$.curr', curr);
  }
});
