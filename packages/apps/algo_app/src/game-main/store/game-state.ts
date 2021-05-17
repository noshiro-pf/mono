import type { InitializedObservable } from '@noshiro/syncflow';
import { pairwise, scan } from '@noshiro/syncflow';
import type { GameState } from '../../state';
import { gameStateReducer, initialGameState } from '../../state';
import { gameStateActionWithTimerExecution$ } from './action';

export const gameState$: InitializedObservable<GameState> =
  gameStateActionWithTimerExecution$.chain(
    scan(gameStateReducer, initialGameState)
  );

gameState$.chain(pairwise()).subscribe(([prev, curr]) => {
  console.log('gameState$.prev', prev, 'gameState$.curr', curr);
});
