import { Arr, castMutable, match, pipe, Uint32 } from 'ts-data-forge';
import type { Reducer } from 'ts-type-forge';
import { add1, sub1, type HistoryState } from '../type/index.mjs';
import { rollTwoDices } from './roll-dice.mjs';

export const historyReducer: Reducer<
  HistoryState,
  'redo' | 'roll-dices' | 'undo'
> = (state, action) => {
  const size = Arr.length(state.history);

  const currIdx = state.index;

  return {
    index: match(action, {
      undo: sub1(currIdx),
      redo: Uint32.min(Uint32.sub(size, 1), add1(currIdx)),
      'roll-dices': add1(currIdx),
    }),

    history: match(action, {
      undo: state.history,
      redo: state.history,
      'roll-dices': pipe(state.history)
        .map((hist) => Arr.take(hist, add1(currIdx)))
        .map((hist) => Arr.toPushed(hist, rollTwoDices()))
        .map(castMutable).value,
    }),
  };
};
