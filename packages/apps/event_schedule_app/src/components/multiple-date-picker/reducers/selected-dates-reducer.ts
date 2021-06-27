import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import type { ReducerType } from '@noshiro/ts-utils';
import { IList, ISetMapped } from '@noshiro/ts-utils';
import type { YmdKey } from '../../../functions';
import { ymdFromKey, ymdToKey } from '../../../functions';

export type SelectedDatesReducerAction = Readonly<
  | { type: 'fill-column'; dates: readonly YearMonthDate[] }
  | { type: 'flip'; dateToFlip: YearMonthDate }
>;

export type SelectedDatesReducerState = ISetMapped<YearMonthDate, YmdKey>;

export const selectedDatesReducerInitialState: SelectedDatesReducerState =
  ISetMapped.new([], ymdToKey, ymdFromKey);

export const selectedDatesReducer: ReducerType<
  SelectedDatesReducerState,
  SelectedDatesReducerAction
> = (state, action) => {
  switch (action.type) {
    case 'flip':
      return state.has(action.dateToFlip)
        ? state.delete(action.dateToFlip)
        : state.add(action.dateToFlip);

    case 'fill-column':
      return IList.isSubset(action.dates, state.toArray())
        ? state.subtract(ISetMapped.new(action.dates, ymdToKey, ymdFromKey))
        : state.union(ISetMapped.new(action.dates, ymdToKey, ymdFromKey));
  }
};
