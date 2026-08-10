import { returnFalse } from '../return-boolean';
import { gameStateReducer, initialGameState } from '../state';
import { type GameState } from '../types';
import { gameStateActionMerged$ } from './action';

export const gameState$: InitializedObservable<GameState> =
  gameStateActionMerged$.chain(scan(gameStateReducer, initialGameState));

gameState$.chain(pairwise()).subscribe(([prev, curr]) => {
  if (returnFalse()) {
    console.log('gameState$.prev', prev, 'gameState$.curr', curr);
  }
});
