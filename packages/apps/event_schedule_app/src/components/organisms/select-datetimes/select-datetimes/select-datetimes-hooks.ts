import type {
  DatetimeRange,
  HoursMinutes,
  TimeRange,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { defaultYearMonthDate } from '@noshiro/event-schedule-app-shared';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { IList } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { getMostFrequentTimeRange } from './get-most-frequent-time-range';
import type { DatetimeListReducerAction } from './select-datetimes-reducer';
import { datetimeListReducer } from './select-datetimes-reducer';

type SelectDatetimesHooks = DeepReadonly<{
  selectedDates: readonly YearMonthDate[];
  onSelectedDatesChange: (v: readonly YearMonthDate[]) => void;
  datetimeListWithHandler: readonly {
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
  onSetTimesPopoverSubmit: (timeRange: TimeRange) => void;
  onSortClick: () => void;
}>;

export const useSelectDatetimesHooks = (
  datetimeList: readonly DatetimeRange[],
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void
): SelectDatetimesHooks => {
  const dispatch = useCallback(
    (action: DatetimeListReducerAction) => {
      onDatetimeListChange(datetimeListReducer(datetimeList, action));
    },
    [datetimeList, onDatetimeListChange]
  );

  const selectedDates = useMemo<readonly YearMonthDate[]>(
    () => datetimeList.map((e) => e.ymd),
    [datetimeList]
  );

  const mostFrequentTimeRange = useMemo<TimeRange>(
    () => getMostFrequentTimeRange(datetimeList),
    [datetimeList]
  );

  /* handlers */

  const onDatetimeRangeYmdChange = useCallback(
    (index: number, ymd: YearMonthDate) => {
      dispatch({ type: 'ymd', index, ymd });
    },
    [dispatch]
  );

  const onDatetimeRangeStartChange = useCallback(
    (index: number, hm: HoursMinutes) => {
      dispatch({ type: 'start', index, hm });
    },
    [dispatch]
  );

  const onDatetimeRangeEndChange = useCallback(
    (index: number, hm: HoursMinutes) => {
      dispatch({ type: 'end', index, hm });
    },
    [dispatch]
  );

  const onDeleteDatetimeClick = useCallback(
    (index: number) => {
      dispatch({ type: 'delete', index });
    },
    [dispatch]
  );

  const onDuplicateDatetimeClick = useCallback(
    (index: number) => {
      dispatch({ type: 'duplicate', index });
    },
    [dispatch]
  );

  const onAddDatetimeClick = useCallback(() => {
    dispatch({
      type: 'addClick',
      datetimeRange: {
        ymd: defaultYearMonthDate,
        timeRange: mostFrequentTimeRange,
      },
    });
  }, [mostFrequentTimeRange, dispatch]);

  const onConfirmDeleteAll = useCallback(() => {
    dispatch({ type: 'deleteAll' });
  }, [dispatch]);

  const onSetTimesAtOneTimeClick = useCallback(
    (timeRange: TimeRange) => {
      dispatch({ type: 'setTimeAtOneTime', timeRange });
    },
    [dispatch]
  );

  const onSortClick = useCallback(() => {
    dispatch({ type: 'sort' });
  }, [dispatch]);

  const onSelectedDatesChange = useCallback(
    (list: readonly YearMonthDate[]) => {
      dispatch({ type: 'fromCalendar', list, mostFrequentTimeRange });
    },
    [mostFrequentTimeRange, dispatch]
  );

  /* view values */

  const datetimeListWithHandler = useMemo(
    () =>
      IList.map(datetimeList, (datetimeRange, index) => ({
        id: index,
        datetimeRange,
        onYmdChange: (ymd: YearMonthDate | undefined) => {
          onDatetimeRangeYmdChange(index, ymd ?? defaultYearMonthDate);
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
      })),
    [
      datetimeList,
      onDatetimeRangeYmdChange,
      onDatetimeRangeStartChange,
      onDatetimeRangeEndChange,
      onDuplicateDatetimeClick,
      onDeleteDatetimeClick,
    ]
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
