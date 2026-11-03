import {
  type InitializedObservable,
  type Observable,
  combine,
  map,
} from 'synstate';
import {
  type IMapMapped,
  ISetMapped,
  Optional,
  isNotUndefined,
  mapNullable,
} from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import type { DayOfWeekIndex, MonthEnum, SafeUint } from 'ts-type-forge';
import {
  type CalendarCurrentPageReducerAction,
  type CalendarCurrentPageReducerState,
  type SelectedDatesReducerAction,
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
  generateCalendar,
  selectedDatesReducer,
  ymdFromKey,
  ymdToKey,
} from '../functions/index.mjs';
import { createReducerWithActions, ymd2day } from '../utils/index.mjs';

export type CalendarCell = Readonly<{
  ymd: YearMonthDate;
  selected: boolean;
  outside: boolean;
  dayType: DayType;
  holidayJpName: string | undefined;
}>;

type MultipleDatePickerState = Readonly<{
  calendarCurrentPage$: InitializedObservable<CalendarCurrentPageReducerState>;
  /** The weeks shown, each of seven days. */
  calendarCells$: InitializedObservable<readonly (readonly CalendarCell[])[]>;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
  onYearChange: (year: SafeUint) => void;
  onMonthChange: (month: MonthEnum) => void;
  onTodayClick: () => void;
  /** Absent when the picker is read-only. */
  onDateClick: ((ymd: YearMonthDate) => void) | undefined;
  /** Absent when the picker is read-only. */
  onWeekdaysHeaderCellClick: ((w: DayOfWeekIndex) => void) | undefined;
}>;

/**
 * The month a multiple date picker shows, its cells, and what its controls do.
 * `setYearMonth$` moves the month it shows.
 */
export const createMultipleDatePickerState = (
  selectedDates$: InitializedObservable<readonly YearMonthDate[]>,
  onSelectedDatesChange:
    ((value: readonly YearMonthDate[]) => void) | undefined,
  setYearMonth$: Observable<CalendarCurrentPageReducerState> | undefined,
  holidaysJpDefinition$: InitializedObservable<
    IMapMapped<YearMonthDate, string, YmdKey> | undefined
  >,
): MultipleDatePickerState => {
  // `setYearMonth$` is one of the reducer's sources, not a subscriber that
  // dispatches, so that its month is set in the update that brings it.
  const [calendarCurrentPage$, dispatch] = createReducerWithActions(
    calendarCurrentPageReducer,
    calendarCurrentPageInitialState(),
    setYearMonth$ === undefined
      ? []
      : [
          setYearMonth$.pipe(
            map(({ year, month }): CalendarCurrentPageReducerAction => ({
              type: 'set-year-month',
              year,
              month,
            })),
          ),
        ],
  );

  const selectedDatesSet$ = selectedDates$.pipe(
    map((dates) => ISetMapped.create(dates, ymdToKey, ymdFromKey)),
  );

  const dates$ = calendarCurrentPage$.pipe(
    map(({ year, month }) => generateCalendar(year, month)),
  );

  const calendarCells$ = combine([
    dates$,
    selectedDatesSet$,
    calendarCurrentPage$,
    holidaysJpDefinition$,
  ]).pipe(
    map(([dates, selectedDatesSet, { month }, holidays]) =>
      dates.map((week) =>
        week.map((ymd): CalendarCell => {
          const dayValue: DayOfWeekIndex = ymd2day(ymd);

          return {
            ymd,
            selected: selectedDatesSet.has(ymd),
            outside: ymd.month !== month,
            dayType:
              (holidays?.has(ymd) ?? false)
                ? 'holiday'
                : dayValue === 0
                  ? 'Sunday'
                  : dayValue === 6
                    ? 'Saturday'
                    : 'normal',
            holidayJpName: mapNullable(holidays, (h) =>
              Optional.toNullable(h.get(ymd)),
            ),
          };
        }),
      ),
    ),
  );

  const selectedDatesDispatch = mapNullable(
    onSelectedDatesChange,
    (f) => (action: SelectedDatesReducerAction) => {
      f(
        Array.from(
          selectedDatesReducer(
            selectedDatesSet$.getSnapshot().value,
            action,
          ).values(),
        ).toSorted(compareYearMonthDate),
      );
    },
  );

  return {
    calendarCurrentPage$,
    calendarCells$,
    onPrevMonthClick: () => {
      dispatch({ type: 'prev-month' });
    },
    onNextMonthClick: () => {
      dispatch({ type: 'next-month' });
    },
    onYearChange: (year) => {
      dispatch({ type: 'set-year', year });
    },
    onMonthChange: (month) => {
      dispatch({ type: 'set-month', month });
    },
    onTodayClick: () => {
      dispatch({ type: 'today' });
    },
    onDateClick: mapNullable(
      selectedDatesDispatch,
      (f) => (ymd: YearMonthDate) => {
        f({ type: 'flip', dateToFlip: ymd });
      },
    ),
    onWeekdaysHeaderCellClick: mapNullable(
      selectedDatesDispatch,
      (f) => (w: DayOfWeekIndex) => {
        const { month } = calendarCurrentPage$.getSnapshot().value;

        f({
          type: 'fill-column',
          dates: dates$
            .getSnapshot()
            .value.map((week) => week[w])
            .filter(isNotUndefined)
            .filter((d) => d.month === month),
        });
      },
    ),
  };
};
