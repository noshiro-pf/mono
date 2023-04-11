import { add1, sub1, type HistoryState } from '../type';
import { rollTwoDices } from './roll-dice';

export const historyReducer: Reducer<
  HistoryState,
  'redo' | 'roll-dices' | 'undo'
> = (state, action) => {
  const size = Arr.length(state.history);
  const currIdx = state.index;

  return {
    index: match(action, {
      undo: sub1(currIdx),
      redo: SafeUint.min(SafeUint.sub(size, 1), add1(currIdx)),
      'roll-dices': add1(currIdx),
    }),

    history: match(action, {
      undo: state.history,
      redo: state.history,
      'roll-dices': pipe(state.history)
        .chain((hist) => Arr.take(hist, add1(currIdx)))
        .chain((hist) => Arr.pushed(hist, rollTwoDices()))
        .chain(castWritable).value,
    }),
  };
};
