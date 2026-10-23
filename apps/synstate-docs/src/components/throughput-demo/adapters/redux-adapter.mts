import {
  Tuple,
  configureStore,
  createAction,
  createSelector,
  isAnyOf,
  lruMemoize,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { Arr } from 'ts-data-forge';
import type { Point, SpringAdapter } from '../../spring-demo/index.mjs';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SPRING_FACTOR, lerp } from './shared.mjs';

export const createReduxThroughputAdapter = (): SpringAdapter => {
  let mut_move: ((pos: Point) => void) | undefined;

  let mut_unsubscribe: (() => void) | undefined;

  return {
    name: 'Redux',
    setup: (chainDepth, { onEmit }) => {
      const startPos: Point = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      } as const;

      const initialState: SpringState = {
        head: startPos,
        stages: Array.from({ length: chainDepth }, () => startPos),
      } as const;

      const store = configureStore({
        reducer: (
          state: SpringState | undefined,
          action: Readonly<UnknownAction>,
        ): SpringState => {
          const current = state ?? initialState;

          return isMove(action) ? advance(current, action.payload) : current;
        },
        middleware: () => new Tuple(),
      });

      // `lruMemoize` for the reason the diamond benchmark gives: no input
      // repeats, and the default `weakMapMemoize` would keep every one.
      const selectPoints = createSelector(
        (state: SpringState) => state.head,
        (state: SpringState) => state.stages,
        (head, stages) => Arr.toUnshifted(head)(stages),
        { memoize: lruMemoize },
      );

      onEmit(selectPoints(store.getState()));

      mut_unsubscribe = store.subscribe(() => {
        onEmit(selectPoints(store.getState()));
      });

      mut_move = (pos) => {
        store.dispatch(move(pos));
      };
    },
    onMouseMove: (pos) => {
      mut_move?.(pos);
    },
    cleanup: () => {
      mut_unsubscribe?.();

      mut_unsubscribe = undefined;

      mut_move = undefined;
    },
  };
};

type SpringState = Readonly<{
  head: Point;
  stages: readonly Point[];
}>;

const move = createAction<Point>('spring/move');

const isMove = isAnyOf(move);

/**
 * A selector cannot read its own previous output, so each stage's position is
 * state and the reducer advances the whole chain, the same imperative loop as
 * the MobX adapter's reaction. A plain reducer rather than `createSlice`, whose
 * Immer draft would wrap every point the loop reads.
 */
const advance = (state: SpringState, head: Point): SpringState => {
  let mut_prev: Point = head;

  const stages = state.stages.map((stage) => {
    const next = lerp(stage, mut_prev, SPRING_FACTOR);

    mut_prev = next;

    return next;
  });

  return { head, stages };
};
