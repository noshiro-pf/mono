import { isDevelopment } from '../env';
import { gameStateReducer, initialGameState } from '../state';
import { type GameState } from '../types';
import { returnBool } from '../utils';
import { gameStateNewActions$ } from './action';

export const gameState$: InitializedObservable<GameState> =
  gameStateNewActions$.chain(scan(gameStateReducer, initialGameState));

if (isDevelopment) {
  gameState$.chain(pairwise()).subscribe(([prev, curr]) => {
    if (returnBool(true)) {
      console.log('gameState$.prev', prev, 'gameState$.curr', curr);
    }
  });
}
