import { Arr, ISetMapped } from 'ts-data-forge';
import { type Reducer } from '../../utils-ported/index.mjs';
import { ymdFromKey, ymdToKey } from '../map-key/index.mjs';

export type SelectedDatesReducerAction = Readonly<
  | { type: 'fill-column'; dates: readonly YearMonthDate[] }
  | { type: 'flip'; dateToFlip: YearMonthDate }
>;

export type SelectedDatesReducerState = ISetMapped<YearMonthDate, YmdKey>;

export const selectedDatesReducerInitialState: SelectedDatesReducerState =
  ISetMapped.create([], ymdToKey, ymdFromKey);

export const selectedDatesReducer: Reducer<
  SelectedDatesReducerState,
  SelectedDatesReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'flip':
      return state.has(action.dateToFlip)
        ? state.delete(action.dateToFlip)
        : state.add(action.dateToFlip);

    case 'fill-column': {
      const selected = state.toArray();

      return Arr.isSubset(action.dates.map(ymdToKey), selected.map(ymdToKey))
        ? state.subtract(ISetMapped.create(action.dates, ymdToKey, ymdFromKey))
        : state.union(ISetMapped.create(action.dates, ymdToKey, ymdFromKey));
    }
  }
};
