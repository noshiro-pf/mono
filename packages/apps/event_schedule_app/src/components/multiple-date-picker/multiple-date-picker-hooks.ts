import { getDay, MonthEnum, WeekDayEnum, YearEnum } from '@noshiro/ts-utils';
import { useCallback, useMemo, useReducer } from 'react';
import { DayType } from '../../types/enum/day-type';
import {
  compareYmd,
  createIYearMonthDate,
  IYearMonthDate,
} from '../../types/record/base/year-month-date';
import { IList, IMap, ISet } from '../../utils/immutable';
import { ymd2Date } from '../../utils/ymdhm2date';
import { generateCalendar } from './generate-calendar';
import {
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
  CalendarCurrentPageReducerState,
} from './reducers/calendar-reducer';
import {
  selectedDatesReducer,
  SelectedDatesReducerAction,
} from './reducers/selected-dates-reducer';

type MultipleDatePickerState = Readonly<{
  calendarCurrentPage: CalendarCurrentPageReducerState;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onYearChange: (year: YearEnum) => void;
  onMonthChange: (month: MonthEnum) => void;
  calendarCells: IList<
    IList<
      Readonly<{
        ymd: IYearMonthDate;
        selected: boolean;
        disabled: boolean;
        dayType: DayType;
        holidayJpName: string | undefined;
      }>
    >
  >;
  onDateClick: (ymd: IYearMonthDate) => void;
  onWeekdaysHeaderCellClick: (w: WeekDayEnum) => void;
  onTodayClick: () => void;
}>;

export const useMultipleDatePickerState = (
  selectedDates: IList<IYearMonthDate>,
  onSelectedDatesChange: (value: IList<IYearMonthDate>) => void,
  holidaysJpDefinition?: IMap<IYearMonthDate, string>
): MultipleDatePickerState => {
  /* states */

  const [calendarCurrentPage, calendarCurrentPageDispatch] = useReducer(
    calendarCurrentPageReducer,
    calendarCurrentPageInitialState()
  );

  /* values */

  const selectedDatesSet = useMemo<ISet<IYearMonthDate>>(
    () => ISet(selectedDates),
    [selectedDates]
  );

  const dates = useMemo<IList<IList<IYearMonthDate>>>(
    () => generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
    [calendarCurrentPage]
  );

  const calendarCells = useMemo<
    IList<
      IList<{
        ymd: IYearMonthDate;
        selected: boolean;
        disabled: boolean;
        dayType: DayType;
        holidayJpName: string | undefined;
      }>
    >
  >(
    () =>
      dates.map((week) =>
        week.map((ymd) => {
          const dayValue: WeekDayEnum = getDay(ymd2Date(ymd));
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
        selectedDatesReducer(selectedDatesSet, action).toList().sort(compareYmd)
      );
    },
    [selectedDatesSet, onSelectedDatesChange]
  );

  const onDateClick = useCallback(
    (ymd: IYearMonthDate) => {
      selectedDatesDispatch({ type: 'flip', dateToFlip: ymd });
    },
    [selectedDatesDispatch]
  );

  const onWeekdaysHeaderCellClick = useCallback(
    (w: WeekDayEnum) => {
      selectedDatesDispatch({
        type: 'fill-column',
        dates: dates
          .map((week) => week.get(w) ?? createIYearMonthDate())
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
