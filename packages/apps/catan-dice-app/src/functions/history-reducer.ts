import {
  decrementHistoryIndex,
  incrementHistoryIndex,
  type HistoryState,
} from '../type';
import { rollTwoDices } from './roll-dice';

export const historyReducer: Reducer<
  HistoryState,
  'redo' | 'roll-dices' | 'undo'
> = (state, action) => {
  const size = Arr.length(state.history);
  const currIdx = state.index;

  return {
    index: match(action, {
      undo: decrementHistoryIndex(currIdx),
      redo: incrementHistoryIndex(currIdx, size),
      'roll-dices': incrementHistoryIndex(currIdx, Uint32.add(size, 1)),
    }),

    history: match(action, {
      undo: state.history,
      redo: state.history,
      'roll-dices': pipe(state.history)
        .chain((hist) => Arr.take(hist, toUint32(Int32.add(currIdx, 1))))
        .chain((hist) => Arr.push(hist, rollTwoDices()))
        .chain(castWritable).value,
    }),
  };
};
