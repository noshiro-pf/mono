import { ReducerType } from '@noshiro/ts-utils';
import { THistoryState } from '../type/history';
import { rollTwoDices } from './roll-dice';

export const historyReducer: ReducerType<
  THistoryState,
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  'undo' | 'redo' | 'roll-dices'
> = (state, action) =>
  state.withMutations((st) => {
    const size = st.history.size;
    const currIdx = st.index;

    st.update('index', (idx) => {
      switch (action) {
        case 'undo':
          return Math.max(-1, idx - 1);
        case 'redo':
          return Math.min(size - 1, idx + 1);
        case 'roll-dices':
          return idx + 1;
      }
    });

    st.update('history', (history) => {
      switch (action) {
        case 'undo':
        case 'redo':
          return st.history;
        case 'roll-dices':
          return history.take(currIdx + 1).push(rollTwoDices());
      }
    });
  });
