import {
  getMonth,
  getYear,
  MonthEnum,
  ReducerType,
  today,
  YearEnum,
} from '@mono/ts-utils';

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
> = ({ year, month }, action) => {
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
