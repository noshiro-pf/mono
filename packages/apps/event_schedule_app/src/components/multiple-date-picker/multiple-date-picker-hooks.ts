import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import {
  compareYmd,
  defaultYearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import type {
  DeepReadonly,
  IMapMapped,
  MonthEnum,
  WeekDayEnum,
  YearEnum,
} from '@noshiro/ts-utils';
import { IList, ISetMapped } from '@noshiro/ts-utils';
import { useCallback, useMemo, useReducer } from 'react';
import type { YmdKey } from '../../functions';
import { ymd2day, ymdFromKey, ymdToKey } from '../../functions';
import { generateCalendar } from './generate-calendar';
import type {
  CalendarCurrentPageReducerState,
  SelectedDatesReducerAction,
} from './reducers';
import {
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
  selectedDatesReducer,
} from './reducers';

type MultipleDatePickerState = DeepReadonly<{
  calendarCurrentPage: CalendarCurrentPageReducerState;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onYearChange: (year: YearEnum) => void;
  onMonthChange: (month: MonthEnum) => void;
  calendarCells: readonly (readonly {
    ymd: YearMonthDate;
    selected: boolean;
    disabled: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }[])[];
  onDateClick: (ymd: YearMonthDate) => void;
  onWeekdaysHeaderCellClick: (w: WeekDayEnum) => void;
  onTodayClick: () => void;
}>;

export const useMultipleDatePickerState = (
  selectedDates: readonly YearMonthDate[],
  onSelectedDatesChange: (value: readonly YearMonthDate[]) => void,
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>
): MultipleDatePickerState => {
  /* states */

  const [calendarCurrentPage, calendarCurrentPageDispatch] = useReducer(
    calendarCurrentPageReducer,
    calendarCurrentPageInitialState()
  );

  /* values */

  const selectedDatesSet = useMemo<ISetMapped<YearMonthDate, YmdKey>>(
    () => ISetMapped.new(selectedDates, ymdToKey, ymdFromKey),
    [selectedDates]
  );

  const dates = useMemo<readonly (readonly YearMonthDate[])[]>(
    () => generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
    [calendarCurrentPage]
  );

  const calendarCells = useMemo<
    readonly (readonly Readonly<{
      ymd: YearMonthDate;
      selected: boolean;
      disabled: boolean;
      dayType: DayType;
      holidayJpName: string | undefined;
    }>[])[]
  >(
    () =>
      dates.map((week) =>
        week.map((ymd) => {
          const dayValue: WeekDayEnum = ymd2day(ymd);
          return {
            ymd,
            selected: selectedDatesSet.has(ymd),
            disabled: ymd.month !== calendarCurrentPage.month,
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
        })
      ),
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

  const selectedDatesDispatch = useCallback(
    (action: SelectedDatesReducerAction) => {
      onSelectedDatesChange(
        IList.sort(
          [...selectedDatesReducer(selectedDatesSet, action)],
          compareYmd
        )
      );
    },
    [selectedDatesSet, onSelectedDatesChange]
  );

  const onDateClick = useCallback(
    (ymd: YearMonthDate) => {
      selectedDatesDispatch({ type: 'flip', dateToFlip: ymd });
    },
    [selectedDatesDispatch]
  );

  const onWeekdaysHeaderCellClick = useCallback(
    (w: WeekDayEnum) => {
      selectedDatesDispatch({
        type: 'fill-column',
        dates: dates
          .map((week) => week[w] ?? defaultYearMonthDate)
          .filter((d) => d?.month === calendarCurrentPage.month),
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
