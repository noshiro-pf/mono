import { IList, match, pipe } from '@noshiro/ts-utils';
import { produce } from 'immer';
import type { HistoryState } from '../type';
import { rollTwoDices } from './roll-dice';

export const historyReducer: ReducerType<
  HistoryState,
  'redo' | 'roll-dices' | 'undo'
> = (state, action) =>
  produce(state, (draft) => {
    const size = draft.history.length;
    const currIdx = draft.index;

    draft.index = match(action, {
      undo: Math.max(-1, currIdx - 1),
      redo: Math.min(size - 1, currIdx + 1),
      'roll-dices': currIdx + 1,
    });

    draft.history = match(action, {
      undo: draft.history,
      redo: draft.history,
      'roll-dices': pipe(draft.history)
        .chain((hist) => IList.take(hist, currIdx + 1))
        .chain((hist) => [...hist, rollTwoDices()]).value,
    });
  });
