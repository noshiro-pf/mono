import { type HistoryState } from '../type';
import { rollTwoDices } from './roll-dice';

export const historyReducer: Reducer<
  HistoryState,
  'redo' | 'roll-dices' | 'undo'
> = (state, action) => {
  const size = state.history.length;
  const currIdx = state.index;

  return {
    index: match(action, {
      undo: Math.max(-1, currIdx - 1),
      redo: Math.min(size - 1, currIdx + 1),
      'roll-dices': currIdx + 1,
    }),

    history: match(action, {
      undo: state.history,
      redo: state.history,
      'roll-dices': pipe(state.history)
        .chain((hist) => Arr.take(hist, currIdx + 1))
        .chain((hist) => [...hist, rollTwoDices()])
        .chain(castWritable).value,
    }),
  };
};
