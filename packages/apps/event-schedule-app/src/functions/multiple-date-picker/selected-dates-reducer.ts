import { ymdFromKey, ymdToKey } from '../map-key';

export type SelectedDatesReducerAction = Readonly<
  | { type: 'fill-column'; dates: readonly YearMonthDate[] }
  | { type: 'flip'; dateToFlip: YearMonthDate }
>;

export type SelectedDatesReducerState = ISetMapped<YearMonthDate, YmdKey>;

export const selectedDatesReducerInitialState: SelectedDatesReducerState =
  ISetMapped.new([], ymdToKey, ymdFromKey);

export const selectedDatesReducer: Reducer<
  SelectedDatesReducerState,
  SelectedDatesReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'flip':
      return state.has(action.dateToFlip)
        ? state.delete(action.dateToFlip)
        : state.add(action.dateToFlip);

    case 'fill-column':
      return Arr.isSubset(
        action.dates.map(ymdToKey),
        state.toArray().map(ymdToKey),
      )
        ? state.subtract(ISetMapped.new(action.dates, ymdToKey, ymdFromKey))
        : state.union(ISetMapped.new(action.dates, ymdToKey, ymdFromKey));
  }
};
