import { ReducerType } from '@mono/ts-utils';
import { IYearMonthDate } from '../../../types/record/base/year-month-date';
import { IList, ISet } from '../../../utils/immutable';

export type SelectedDatesReducerAction =
  | { type: 'flip'; dateToFlip: IYearMonthDate }
  | { type: 'fill-column'; dates: IList<IYearMonthDate> };

export type SelectedDatesReducerState = ISet<IYearMonthDate>;

export const selectedDatesReducerInitialState: SelectedDatesReducerState = ISet<
  IYearMonthDate
>();

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
