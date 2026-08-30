import { Num, asSafeUint } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { type MonthEnum, type SafeUint } from 'ts-type-forge';
import { type Reducer } from '../../utils-ported/index.mjs';

export type CalendarCurrentPageReducerState = Readonly<{
  year: SafeUint;
  month: MonthEnum;
}>;

export type CalendarCurrentPageReducerAction = Readonly<
  | { type: 'next-month' }
  | { type: 'prev-month' }
  | { type: 'set-month'; month: MonthEnum }
  | { type: 'set-year-month'; year: SafeUint; month: MonthEnum }
  | { type: 'set-year'; year: SafeUint }
  | { type: 'today' }
>;

export const calendarCurrentPageInitialState =
  (): CalendarCurrentPageReducerState =>
    ({
      year: DateUtils.getLocaleYear(DateUtils.today()),
      month: DateUtils.getLocaleMonth(DateUtils.today()),
    }) as const;

export const calendarCurrentPageReducer: Reducer<
  CalendarCurrentPageReducerState,
  CalendarCurrentPageReducerAction
> = ({ year, month }, action) => {
  switch (action.type) {
    case 'prev-month':
      return month === 1
        ? { year: asSafeUint(year - 1) satisfies SafeUint, month: 12 }
        : { year, month: Num.decrement(month) satisfies MonthEnum };

    case 'next-month':
      return month === 12
        ? { year: asSafeUint(year + 1) satisfies SafeUint, month: 1 }
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
