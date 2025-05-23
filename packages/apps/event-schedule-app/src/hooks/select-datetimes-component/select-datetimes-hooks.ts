import { yearMonthDateInitialValue } from '../../constants';
import {
  datetimeListReducer,
  getMostFrequentTimeRange,
  type DatetimeListReducerAction,
} from '../../functions';

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
      checkboxState: Record<DayOfWeekName, boolean>;
    }>,
  ) => void;
  onSortClick: () => void;
}>;

export const useSelectDatetimesHooks = (
  datetimeList: readonly DatetimeRange[],
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void,
): SelectDatetimesHooks => {
  const dispatch = useCallback(
    (action: DatetimeListReducerAction) => {
      onDatetimeListChange(datetimeListReducer(datetimeList, action));
    },
    [datetimeList, onDatetimeListChange],
  );

  const selectedDates = useMemo<readonly YearMonthDate[]>(
    () => datetimeList.map((e) => e.ymd),
    [datetimeList],
  );

  const mostFrequentTimeRange = useMemo<TimeRange>(
    () => getMostFrequentTimeRange(datetimeList),
    [datetimeList],
  );

  /* handlers */

  const onDatetimeRangeYmdChange = useCallback(
    (index: NumberType.ArraySize, ymd: YearMonthDate) => {
      dispatch({ type: 'ymd', index, ymd });
    },
    [dispatch],
  );

  const onDatetimeRangeStartChange = useCallback(
    (index: NumberType.ArraySize, hm: HoursMinutes) => {
      dispatch({ type: 'start', index, hm });
    },
    [dispatch],
  );

  const onDatetimeRangeEndChange = useCallback(
    (index: NumberType.ArraySize, hm: HoursMinutes) => {
      dispatch({ type: 'end', index, hm });
    },
    [dispatch],
  );

  const onDeleteDatetimeClick = useCallback(
    (index: NumberType.ArraySize) => {
      dispatch({ type: 'delete', index });
    },
    [dispatch],
  );

  const onDuplicateDatetimeClick = useCallback(
    (index: NumberType.ArraySize) => {
      dispatch({ type: 'duplicate', index });
    },
    [dispatch],
  );

  const onAddDatetimeClick = useCallback(() => {
    dispatch({
      type: 'addClick',
      datetimeRange: {
        ymd: yearMonthDateInitialValue,
        timeRange: mostFrequentTimeRange,
      },
    });
  }, [mostFrequentTimeRange, dispatch]);

  const onConfirmDeleteAll = useCallback(() => {
    dispatch({ type: 'deleteAll' });
  }, [dispatch]);

  const onSetTimesAtOneTimeClick = useCallback(
    ({
      checkboxState,
      timeRange,
    }: Readonly<{
      timeRange: TimeRange;
      checkboxState: Record<DayOfWeekName, boolean>;
    }>) => {
      dispatch({ type: 'setTimeAtOneTime', checkboxState, timeRange });
    },
    [dispatch],
  );

  const onSortClick = useCallback(() => {
    dispatch({ type: 'sort' });
  }, [dispatch]);

  const onSelectedDatesChange = useCallback(
    (list: readonly YearMonthDate[]) => {
      dispatch({ type: 'fromCalendar', list, mostFrequentTimeRange });
    },
    [mostFrequentTimeRange, dispatch],
  );

  /* view values */

  const datetimeListWithHandler = useMemo(
    () =>
      datetimeList.map((datetimeRange, index) => ({
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
      })),
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
