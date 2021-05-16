import type { ReducerType } from '@noshiro/ts-utils';
import type { IYearMonthDate } from '../../../types/record/base/year-month-date';
import type { IList } from '../../../utils/immutable';
import { ISet } from '../../../utils/immutable';

export type SelectedDatesReducerAction = Readonly<
  | { type: 'fill-column'; dates: IList<IYearMonthDate> }
  | { type: 'flip'; dateToFlip: IYearMonthDate }
>;

export type SelectedDatesReducerState = ISet<IYearMonthDate>;

export const selectedDatesReducerInitialState: SelectedDatesReducerState = ISet<IYearMonthDate>();

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
      return action.dates.isSubset(state)
        ? state.subtract(action.dates)
        : state.union(action.dates);
  }
};
