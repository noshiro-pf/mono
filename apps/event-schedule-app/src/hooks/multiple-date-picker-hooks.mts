import * as React from 'react';
import { type Observable as SynstateObservable, source } from 'synstate';
import { useObservableEffect } from 'synstate-react-hooks';
import {
  type IMapMapped,
  ISetMapped,
  Optional,
  asSafeUint,
} from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import {
  type DayOfWeekIndex,
  type DeepReadonly,
  type MonthEnum,
  type SafeUint,
} from 'ts-type-forge';
import { yearMonthDateInitialValue } from '../constants/index.mjs';
import {
  type CalendarCurrentPageReducerState,
  type SelectedDatesReducerAction,
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
  generateCalendar,
  selectedDatesReducer,
  ymdFromKey,
  ymdToKey,
} from '../functions/index.mjs';
import { mapOptional } from '../utils-ported/index.mjs';
import { ymd2day } from '../utils/index.mjs';

const neverEmits$ = source<CalendarCurrentPageReducerState>();

type MultipleDatePickerState = DeepReadonly<{
  calendarCurrentPage: CalendarCurrentPageReducerState;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onYearChange: (year: SafeUint) => void;
  onMonthChange: (month: MonthEnum) => void;
  calendarCells: {
    index: SafeUint;
    week: {
      ymd: YearMonthDate;
      selected: boolean;
      outside: boolean;
      dayType: DayType;
      holidayJpName: string | undefined;
    }[];
  }[];
  onDateClick?: (ymd: YearMonthDate) => void;
  onWeekdaysHeaderCellClick?: (w: DayOfWeekIndex) => void;
  onTodayClick: () => void;
}>;

export const useMultipleDatePickerState = (
  selectedDates: readonly YearMonthDate[],
  onSelectedDatesChange?: (value: readonly YearMonthDate[]) => void,
  setYearMonth$?: SynstateObservable<CalendarCurrentPageReducerState>,
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>,
): MultipleDatePickerState => {
  /* states */

  const [calendarCurrentPage, calendarCurrentPageDispatch] = React.useReducer(
    calendarCurrentPageReducer,
    calendarCurrentPageInitialState(),
  );

  // `source<A>()` with no arguments never emits, which is what the old
  // `fromArray([])` was for: a stand-in when no observable was passed.
  useObservableEffect(setYearMonth$ ?? neverEmits$, ({ year, month }) => {
    calendarCurrentPageDispatch({ type: 'set-year-month', year, month });
  });

  /* values */

  const selectedDatesSet = React.useMemo<ISetMapped<YearMonthDate, YmdKey>>(
    () => ISetMapped.create(selectedDates, ymdToKey, ymdFromKey),
    [selectedDates],
  );

  const dates = React.useMemo<DeepReadonly<YearMonthDate[][]>>(
    () => generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
    [calendarCurrentPage],
  );

  const calendarCells = React.useMemo<
    DeepReadonly<
      {
        week: {
          ymd: YearMonthDate;
          selected: boolean;
          outside: boolean;
          dayType: DayType;
          holidayJpName: string | undefined;
        }[];
        index: SafeUint;
      }[]
    >
  >(
    () =>
      dates.map((week, indexRaw) => ({
        // `Array.prototype.map` hands back a plain number; the row carries the
        // branded index.
        index: asSafeUint(indexRaw),
        week: week.map((ymd) => {
          const dayValue: DayOfWeekIndex = ymd2day(ymd);

          return {
            ymd,
            selected: selectedDatesSet.has(ymd),
            outside: ymd.month !== calendarCurrentPage.month,
            dayType:
              (holidaysJpDefinition?.has(ymd) ?? false)
                ? 'holiday'
                : dayValue === 0
                  ? 'Sunday'
                  : dayValue === 6
                    ? 'Saturday'
                    : 'normal',
            holidayJpName: mapOptional(holidaysJpDefinition, (__m) =>
              Optional.toNullable(__m.get(ymd)),
            ),
          };
        }),
      })),
    [dates, selectedDatesSet, calendarCurrentPage, holidaysJpDefinition],
  );

  /* handlers */

  const onPrevMonthClick = React.useCallback(() => {
    calendarCurrentPageDispatch({ type: 'prev-month' });
  }, []);

  const onNextMonthClick = React.useCallback(() => {
    calendarCurrentPageDispatch({ type: 'next-month' });
  }, []);

  const onYearChange = React.useCallback((year: SafeUint) => {
    calendarCurrentPageDispatch({ type: 'set-year', year });
  }, []);

  const onMonthChange = React.useCallback((month: MonthEnum) => {
    calendarCurrentPageDispatch({ type: 'set-month', month });
  }, []);

  const onTodayClick = React.useCallback(() => {
    calendarCurrentPageDispatch({ type: 'today' });
  }, []);

  const selectedDatesDispatch = React.useMemo(
    () =>
      mapOptional(
        onSelectedDatesChange,
        (f) => (action: SelectedDatesReducerAction) => {
          f(
            Array.from(
              selectedDatesReducer(selectedDatesSet, action).values(),
            ).toSorted(compareYearMonthDate),
          );
        },
      ),
    [selectedDatesSet, onSelectedDatesChange],
  );

  const onDateClick = React.useMemo(
    () =>
      mapOptional(selectedDatesDispatch, (f) => (ymd: YearMonthDate) => {
        f({ type: 'flip', dateToFlip: ymd });
      }),
    [selectedDatesDispatch],
  );

  const onWeekdaysHeaderCellClick = React.useMemo(
    () =>
      mapOptional(selectedDatesDispatch, (f) => (w: DayOfWeekIndex) => {
        f({
          type: 'fill-column',
          dates: dates
            .map((week) => week[w] ?? yearMonthDateInitialValue)
            .filter((d) => d.month === calendarCurrentPage.month),
        });
      }),
    [selectedDatesDispatch, dates, calendarCurrentPage.month],
  );

  return {
    calendarCurrentPage,
    onPrevMonthClick,
    onNextMonthClick,
    onYearChange,
    onMonthChange,
    calendarCells,
    onDateClick,
    onWeekdaysHeaderCellClick,
    onTodayClick,
  };
};
