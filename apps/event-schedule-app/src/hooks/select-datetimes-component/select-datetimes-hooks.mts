import * as React from 'react';
import { asUint32, type SizeType } from 'ts-data-forge';
import {
  type DayOfWeekName,
  type DeepReadonly,
  type ReadonlyRecord,
} from 'ts-type-forge';
import { yearMonthDateInitialValue } from '../../constants/index.mjs';
import {
  datetimeListReducer,
  getMostFrequentTimeRange,
  type DatetimeListReducerAction,
} from '../../functions/index.mjs';

type SelectDatetimesHooks = DeepReadonly<{
  selectedDates: YearMonthDate[];
  onSelectedDatesChange: (v: readonly YearMonthDate[]) => void;
  datetimeListWithHandler: {
    id: number;
    datetimeRange: DatetimeRange;
    onYmdChange: (ymd: YearMonthDate | undefined) => void;
    onRangeStartChange: (hm: HoursMinutes) => void;
    onRangeEndChange: (hm: HoursMinutes) => void;
    onDuplicateClick: () => void;
    onDeleteClick: () => void;
  }[];
  onAddDatetimeClick: () => void;
  onConfirmDeleteAll: () => void;
  setTimesPopoverInitialValue: TimeRange;
  onSetTimesPopoverSubmit: (
    state: Readonly<{
      timeRange: TimeRange;
      checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
    }>,
  ) => void;
  onSortClick: () => void;
}>;

export const useSelectDatetimesHooks = (
  datetimeList: readonly DatetimeRange[],
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void,
): SelectDatetimesHooks => {
  const dispatch = React.useCallback(
    (action: DatetimeListReducerAction) => {
      onDatetimeListChange(datetimeListReducer(datetimeList, action));
    },
    [datetimeList, onDatetimeListChange],
  );

  const selectedDates = React.useMemo<readonly YearMonthDate[]>(
    () => datetimeList.map((e) => e.ymd),
    [datetimeList],
  );

  const mostFrequentTimeRange = React.useMemo<TimeRange>(
    () => getMostFrequentTimeRange(datetimeList),
    [datetimeList],
  );

  /* handlers */

  const onDatetimeRangeYmdChange = React.useCallback(
    (index: SizeType.Arr, ymd: YearMonthDate) => {
      dispatch({ type: 'ymd', index, ymd });
    },
    [dispatch],
  );

  const onDatetimeRangeStartChange = React.useCallback(
    (index: SizeType.Arr, hm: HoursMinutes) => {
      dispatch({ type: 'start', index, hm });
    },
    [dispatch],
  );

  const onDatetimeRangeEndChange = React.useCallback(
    (index: SizeType.Arr, hm: HoursMinutes) => {
      dispatch({ type: 'end', index, hm });
    },
    [dispatch],
  );

  const onDeleteDatetimeClick = React.useCallback(
    (index: SizeType.Arr) => {
      dispatch({ type: 'delete', index });
    },
    [dispatch],
  );

  const onDuplicateDatetimeClick = React.useCallback(
    (index: SizeType.Arr) => {
      dispatch({ type: 'duplicate', index });
    },
    [dispatch],
  );

  const onAddDatetimeClick = React.useCallback(() => {
    dispatch({
      type: 'addClick',
      datetimeRange: {
        ymd: yearMonthDateInitialValue,
        timeRange: mostFrequentTimeRange,
      },
    });
  }, [mostFrequentTimeRange, dispatch]);

  const onConfirmDeleteAll = React.useCallback(() => {
    dispatch({ type: 'deleteAll' });
  }, [dispatch]);

  const onSetTimesAtOneTimeClick = React.useCallback(
    ({
      checkboxState,
      timeRange,
    }: Readonly<{
      timeRange: TimeRange;
      checkboxState: ReadonlyRecord<DayOfWeekName, boolean>;
    }>) => {
      dispatch({ type: 'setTimeAtOneTime', checkboxState, timeRange });
    },
    [dispatch],
  );

  const onSortClick = React.useCallback(() => {
    dispatch({ type: 'sort' });
  }, [dispatch]);

  const onSelectedDatesChange = React.useCallback(
    (list: readonly YearMonthDate[]) => {
      dispatch({ type: 'fromCalendar', list, mostFrequentTimeRange });
    },
    [mostFrequentTimeRange, dispatch],
  );

  /* view values */

  const datetimeListWithHandler = React.useMemo(
    () =>
      datetimeList.map((datetimeRange, indexRaw) => {
        // `Array.prototype.map` hands back a plain number; the handlers below
        // take the branded array index the store uses.
        const index = asUint32(indexRaw);

        return {
          id: index,
          datetimeRange,
          onYmdChange: (ymd: YearMonthDate | undefined) => {
            onDatetimeRangeYmdChange(index, ymd ?? yearMonthDateInitialValue);
          },
          onRangeStartChange: (hm: HoursMinutes) => {
            onDatetimeRangeStartChange(index, hm);
          },
          onRangeEndChange: (hm: HoursMinutes) => {
            onDatetimeRangeEndChange(index, hm);
          },
          onDuplicateClick: () => {
            onDuplicateDatetimeClick(index);
          },
          onDeleteClick: () => {
            onDeleteDatetimeClick(index);
          },
        };
      }),
    [
      datetimeList,
      onDatetimeRangeYmdChange,
      onDatetimeRangeStartChange,
      onDatetimeRangeEndChange,
      onDuplicateDatetimeClick,
      onDeleteDatetimeClick,
    ],
  );

  return {
    selectedDates,
    onSelectedDatesChange,
    datetimeListWithHandler,
    onAddDatetimeClick,
    onConfirmDeleteAll,
    setTimesPopoverInitialValue: mostFrequentTimeRange,
    onSetTimesPopoverSubmit: onSetTimesAtOneTimeClick,
    onSortClick,
  };
};
