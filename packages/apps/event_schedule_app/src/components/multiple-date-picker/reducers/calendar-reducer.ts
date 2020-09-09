import { ReducerType } from '@mono/ts-utils';
import { getMonth } from '../../../utils/datetime/functions/date-method-wrapper/month';
import { today } from '../../../utils/datetime/functions/date-method-wrapper/today';
import { getYear } from '../../../utils/datetime/functions/date-method-wrapper/year';
import { MonthEnum } from '../../../utils/datetime/types/month';
import { YearEnum } from '../../../utils/datetime/types/year';

export type CalendarCurrentPageReducerState = {
  year: YearEnum;
  month: MonthEnum;
};
export type CalendarCurrentPageReducerAction =
  | { type: 'prev-month' }
  | { type: 'next-month' }
  | { type: 'set-year'; year: YearEnum }
  | { type: 'set-month'; month: MonthEnum };

export const calendarCurrentPageInitialState: CalendarCurrentPageReducerState = {
  year: getYear(today()),
  month: getMonth(today()),
};

export const calendarCurrentPageReducer: ReducerType<
  CalendarCurrentPageReducerState,
  CalendarCurrentPageReducerAction
> = (state, action) => {
  const { year, month } = state;
  switch (action.type) {
    case 'prev-month':
      return month === 1
        ? { year: (year - 1) as YearEnum, month: 12 }
        : { year, month: (month - 1) as MonthEnum };

    case 'next-month':
      return month === 12
        ? { year: (year + 1) as YearEnum, month: 1 }
        : { year, month: (month + 1) as MonthEnum };

    case 'set-month':
      return { year, month: action.month };

    case 'set-year':
      return { year: action.year, month };
  }
};
