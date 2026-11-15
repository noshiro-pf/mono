import type { Reducer } from 'ts-type-forge';
import type { GameState, GameStateAction } from '../types/index.mjs';
import { gameStateMachine } from './game-state-machine.mjs';

/** Folds a batch of actions, each through the machine's reducer. */
export const gameStateReducer: Reducer<
  GameState,
  readonly GameStateAction[]
> = (state, actions) => actions.reduce(gameStateMachine.reducer, state);
