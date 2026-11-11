import { map, type InitializedObservable } from 'synstate';
import { Optional, type SizeType } from 'ts-data-forge';
import type { DayOfWeekName, ReadonlyRecord } from 'ts-type-forge';
import { yearMonthDateInitialValue } from '../../constants/index.mjs';
import {
  datetimeListReducer,
  getMostFrequentTimeRange,
  type DatetimeListReducerAction,
} from '../../functions/index.mjs';

export type SetTimesSubmission = Readonly<{
  timeRange: TimeRange;
  checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
}>;

type SelectDatetimesState = Readonly<{
  selectedDates$: InitializedObservable<readonly YearMonthDate[]>;
  onSelectedDatesChange: (v: readonly YearMonthDate[]) => void;
  /** The time range most rows have: what a new row and the popover start at. */
  mostFrequentTimeRange$: InitializedObservable<TimeRange>;
  onYmdChange: (index: SizeType.Arr, ymd: YearMonthDate | undefined) => void;
  onRangeStartChange: (index: SizeType.Arr, hm: HoursMinutes) => void;
  onRangeEndChange: (index: SizeType.Arr, hm: HoursMinutes) => void;
  onDuplicateClick: (index: SizeType.Arr) => void;
  onDeleteClick: (index: SizeType.Arr) => void;
  onAddDatetimeClick: () => void;
  onConfirmDeleteAll: () => void;
  onSetTimesPopoverSubmit: (state: SetTimesSubmission) => void;
  onSortClick: () => void;
}>;

/** What the date and time list's controls do to the list. */
export const createSelectDatetimesState = (
  datetimeList$: InitializedObservable<readonly DatetimeRange[]>,
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void,
): SelectDatetimesState => {
  const dispatch = (action: DatetimeListReducerAction): void => {
    onDatetimeListChange(
      datetimeListReducer(Optional.unwrap(datetimeList$.getSnapshot()), action),
    );
  };

  const selectedDates$ = datetimeList$.pipe(
    map((list) => list.map((e) => e.ymd)),
  );

  const mostFrequentTimeRange$ = datetimeList$.pipe(
    map(getMostFrequentTimeRange),
  );

  return {
    selectedDates$,
    mostFrequentTimeRange$,
    onSelectedDatesChange: (list) => {
      dispatch({
        type: 'fromCalendar',
        list,
        mostFrequentTimeRange: Optional.unwrap(
          mostFrequentTimeRange$.getSnapshot(),
        ),
      });
    },
    onYmdChange: (index, ymd) => {
      dispatch({ type: 'ymd', index, ymd: ymd ?? yearMonthDateInitialValue() });
    },
    onRangeStartChange: (index, hm) => {
      dispatch({ type: 'start', index, hm });
    },
    onRangeEndChange: (index, hm) => {
      dispatch({ type: 'end', index, hm });
    },
    onDuplicateClick: (index) => {
      dispatch({ type: 'duplicate', index });
    },
    onDeleteClick: (index) => {
      dispatch({ type: 'delete', index });
    },
    onAddDatetimeClick: () => {
      dispatch({
        type: 'addClick',
        datetimeRange: {
          ymd: yearMonthDateInitialValue(),
          timeRange: Optional.unwrap(mostFrequentTimeRange$.getSnapshot()),
        },
      });
    },
    onConfirmDeleteAll: () => {
      dispatch({ type: 'deleteAll' });
    },
    onSetTimesPopoverSubmit: ({ checkboxState, timeRange }) => {
      dispatch({ type: 'setTimeAtOneTime', checkboxState, timeRange });
    },
    onSortClick: () => {
      dispatch({ type: 'sort' });
    },
  };
};
