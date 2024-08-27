import { compareYmd } from '@noshiro/event-schedule-app-shared';
import { fromArray } from '@noshiro/syncflow';
import { yearMonthDateInitialValue } from '../constants';
import {
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
  generateCalendar,
  selectedDatesReducer,
  ymdFromKey,
  ymdToKey,
  type CalendarCurrentPageReducerState,
  type SelectedDatesReducerAction,
} from '../functions';
import { ymd2day } from '../utils';

type MultipleDatePickerState = DeepReadonly<{
  calendarCurrentPage: CalendarCurrentPageReducerState;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onYearChange: (year: YearEnum) => void;
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
  setYearMonth$?: Observable<CalendarCurrentPageReducerState>,
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>,
): MultipleDatePickerState => {
  /* states */

  const [calendarCurrentPage, calendarCurrentPageDispatch] = useReducer(
    calendarCurrentPageReducer,
    calendarCurrentPageInitialState(),
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
    [selectedDates],
  );

  const dates = useMemo<DeepReadonly<YearMonthDate[][]>>(
    () => generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
    [calendarCurrentPage],
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
        index: SafeUint;
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
    [dates, selectedDatesSet, calendarCurrentPage, holidaysJpDefinition],
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
      mapOptional(
        onSelectedDatesChange,
        (f) => (action: SelectedDatesReducerAction) => {
          f(
            Array.from(
              selectedDatesReducer(selectedDatesSet, action).values(),
            ).toSorted(compareYmd),
          );
        },
      ),
    [selectedDatesSet, onSelectedDatesChange],
  );

  const onDateClick = useMemo(
    () =>
      mapOptional(selectedDatesDispatch, (f) => (ymd: YearMonthDate) => {
        f({ type: 'flip', dateToFlip: ymd });
      }),
    [selectedDatesDispatch],
  );

  const onWeekdaysHeaderCellClick = useMemo(
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
