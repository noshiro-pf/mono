import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import {
  compareYmd,
  yearMonthDateDefaultValue,
} from '@noshiro/event-schedule-app-shared';
import type { Observable } from '@noshiro/syncflow';
import { fromArray } from '@noshiro/syncflow';
import { useObservableEffect } from '@noshiro/syncflow-react-hooks';
import type { IMapMapped } from '@noshiro/ts-utils';
import { IList, ISetMapped } from '@noshiro/ts-utils';
import { useCallback, useMemo, useReducer } from 'react';
import type {
  CalendarCurrentPageReducerState,
  SelectedDatesReducerAction,
  YmdKey,
} from '../functions';
import {
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
  generateCalendar,
  selectedDatesReducer,
  ymd2day,
  ymdFromKey,
  ymdToKey,
} from '../functions';

type MultipleDatePickerState = DeepReadonly<{
  calendarCurrentPage: CalendarCurrentPageReducerState;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onYearChange: (year: YearEnum) => void;
  onMonthChange: (month: MonthEnum) => void;
  calendarCells: {
    index: number;
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
  setYearMonth$?: Observable<CalendarCurrentPageReducerState>,
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>
): MultipleDatePickerState => {
  /* states */

  const [calendarCurrentPage, calendarCurrentPageDispatch] = useReducer(
    calendarCurrentPageReducer,
    calendarCurrentPageInitialState()
  );

  useObservableEffect(setYearMonth$ ?? fromArray([]), ({ year, month }) => {
    calendarCurrentPageDispatch({
      type: 'set-year-month',
      year,
      month,
    });
  });

  /* values */

  const selectedDatesSet = useMemo<ISetMapped<YearMonthDate, YmdKey>>(
    () => ISetMapped.new(selectedDates, ymdToKey, ymdFromKey),
    [selectedDates]
  );

  const dates = useMemo<DeepReadonly<YearMonthDate[][]>>(
    () => generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
    [calendarCurrentPage]
  );

  const calendarCells = useMemo<
    DeepReadonly<
      {
        week: {
          ymd: YearMonthDate;
          selected: boolean;
          outside: boolean;
          dayType: DayType;
          holidayJpName: string | undefined;
        }[];
        index: number;
      }[]
    >
  >(
    () =>
      dates.map((week, index) => ({
        index,
        week: week.map((ymd) => {
          const dayValue: DayOfWeekIndex = ymd2day(ymd);
          return {
            ymd,
            selected: selectedDatesSet.has(ymd),
            outside: ymd.month !== calendarCurrentPage.month,
            dayType:
              holidaysJpDefinition?.has(ymd) ?? false
                ? 'holiday'
                : dayValue === 0
                ? 'Sunday'
                : dayValue === 6
                ? 'Saturday'
                : 'normal',
            holidayJpName: holidaysJpDefinition?.get(ymd),
          };
        }),
      })),
    [dates, selectedDatesSet, calendarCurrentPage, holidaysJpDefinition]
  );

  /* handlers */

  const onPrevMonthClick = useCallback(() => {
    calendarCurrentPageDispatch({ type: 'prev-month' });
  }, []);

  const onNextMonthClick = useCallback(() => {
    calendarCurrentPageDispatch({ type: 'next-month' });
  }, []);

  const onYearChange = useCallback((year: YearEnum) => {
    calendarCurrentPageDispatch({ type: 'set-year', year });
  }, []);

  const onMonthChange = useCallback((month: MonthEnum) => {
    calendarCurrentPageDispatch({ type: 'set-month', month });
  }, []);

  const onTodayClick = useCallback(() => {
    calendarCurrentPageDispatch({ type: 'today' });
  }, []);

  const selectedDatesDispatch = useMemo(
    () =>
      onSelectedDatesChange === undefined
        ? undefined
        : (action: SelectedDatesReducerAction) => {
            onSelectedDatesChange(
              IList.sort(
                Array.from(
                  selectedDatesReducer(selectedDatesSet, action).values()
                ),
                compareYmd
              )
            );
          },
    [selectedDatesSet, onSelectedDatesChange]
  );

  const onDateClick = useMemo(
    () =>
      selectedDatesDispatch === undefined
        ? undefined
        : (ymd: YearMonthDate) => {
            selectedDatesDispatch({ type: 'flip', dateToFlip: ymd });
          },
    [selectedDatesDispatch]
  );

  const onWeekdaysHeaderCellClick = useMemo(
    () =>
      selectedDatesDispatch === undefined
        ? undefined
        : (w: DayOfWeekIndex) => {
            selectedDatesDispatch({
              type: 'fill-column',
              dates: dates
                .map((week) => week[w] ?? yearMonthDateDefaultValue)
                .filter((d) => d.month === calendarCurrentPage.month),
            });
          },
    [selectedDatesDispatch, dates, calendarCurrentPage.month]
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
