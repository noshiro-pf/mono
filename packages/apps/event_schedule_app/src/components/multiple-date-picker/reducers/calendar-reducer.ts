import {
  getMonth,
  getYear,
  MonthEnum,
  ReducerType,
  today,
  YearEnum,
} from '@noshiro/ts-utils';

export type CalendarCurrentPageReducerState = Readonly<{
  year: YearEnum;
  month: MonthEnum;
}>;

export type CalendarCurrentPageReducerAction = Readonly<
  | { type: 'next-month' }
  | { type: 'prev-month' }
  | { type: 'set-month'; month: MonthEnum }
  | { type: 'set-year'; year: YearEnum }
  | { type: 'today' }
>;

export const calendarCurrentPageInitialState = (): CalendarCurrentPageReducerState => ({
  year: getYear(today()),
  month: getMonth(today()),
});

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

    case 'today':
      return calendarCurrentPageInitialState();
  }
};
