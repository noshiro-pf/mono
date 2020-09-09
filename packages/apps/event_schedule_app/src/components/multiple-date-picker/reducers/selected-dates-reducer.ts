import { ReducerType } from '@mono/ts-utils';
import { IYearMonthDateType } from '../../../types/record/year-month-date';
import { IList, ISet } from '../../../utils/immutable';

type SelectedDatesReducerAction =
  | { type: 'flip'; dateToFlip: IYearMonthDateType }
  | { type: 'fill-column'; dates: IList<IYearMonthDateType> }
  | { type: 'fromProps'; dates: IList<IYearMonthDateType> };

type SelectedDatesReducerState = {
  lastAction: SelectedDatesReducerAction['type'];
  value: ISet<IYearMonthDateType>;
};

export const selectedDatesReducerInitialState: SelectedDatesReducerState = {
  lastAction: 'fromProps',
  value: ISet<IYearMonthDateType>(),
};

export const selectedDatesReducer: ReducerType<
  SelectedDatesReducerState,
  SelectedDatesReducerAction
> = (state, action) => {
  const nextState = ((prevState: SelectedDatesReducerState['value']) => {
    switch (action.type) {
      case 'flip':
        return prevState.has(action.dateToFlip)
          ? prevState.delete(action.dateToFlip)
          : prevState.add(action.dateToFlip);

      case 'fill-column':
        return action.dates.isSubset(prevState)
          ? prevState.subtract(action.dates)
          : prevState.union(action.dates);

      case 'fromProps':
        return ISet(action.dates);
    }
  })(state.value);

  return { lastAction: action.type, value: nextState };
};
