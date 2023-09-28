export type CalendarCurrentPageReducerState = Readonly<{
  year: YearEnum;
  month: MonthEnum;
}>;

export type CalendarCurrentPageReducerAction = Readonly<
  | { type: 'next-month' }
  | { type: 'prev-month' }
  | { type: 'set-month'; month: MonthEnum }
  | { type: 'set-year-month'; year: YearEnum; month: MonthEnum }
  | { type: 'set-year'; year: YearEnum }
  | { type: 'today' }
>;

export const calendarCurrentPageInitialState =
  (): CalendarCurrentPageReducerState => ({
    year: DateUtils.getLocaleYear(DateUtils.today()),
    month: DateUtils.getLocaleMonth(DateUtils.today()),
  });

export const calendarCurrentPageReducer: Reducer<
  CalendarCurrentPageReducerState,
  CalendarCurrentPageReducerAction
> = ({ year, month }, action) => {
  switch (action.type) {
    case 'prev-month':
      return month === 1
        ? { year: toSafeUint(year - 1) satisfies YearEnum, month: 12 }
        : { year, month: Num.decrement(month) satisfies MonthEnum };

    case 'next-month':
      return month === 12
        ? { year: toSafeUint(year + 1) satisfies YearEnum, month: 1 }
        : { year, month: Num.increment(month) satisfies MonthEnum };

    case 'set-month':
      return { year, month: action.month };

    case 'set-year':
      return { year: action.year, month };

    case 'set-year-month':
      return { year: action.year, month: action.month };

    case 'today':
      return calendarCurrentPageInitialState();
  }
};
