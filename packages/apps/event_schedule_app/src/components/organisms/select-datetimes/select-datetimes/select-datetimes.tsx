import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useMemo } from 'react';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { IHoursMinutes } from '../../../../types/record/base/hours-minutes';
import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../../../../types/record/base/year-month-date';
import {
  createIDatetimeRange,
  IDatetimeRange,
} from '../../../../types/record/datetime-range';
import { ITimeRange } from '../../../../types/record/time-range';
import { IList } from '../../../../utils/immutable';
import { getMostFrequentTimeRange } from './get-most-frequent-time-range';
import {
  datetimeListReducer,
  DatetimeListReducerAction,
} from './select-datetimes-reducer';
import { SelectDatetimeView } from './select-datetimes-view';

interface Props {
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeList: IList<IDatetimeRange>;
  onDatetimeListChange: (list: IList<IDatetimeRange>) => void;
}

export const SelectDatetimes = memoNamed<Props>(
  'SelectDatetimes',
  ({
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeList,
    onDatetimeListChange,
  }) => {
    const dispatch = useCallback(
      (action: DatetimeListReducerAction) => {
        onDatetimeListChange(datetimeListReducer(datetimeList, action));
      },
      [datetimeList, onDatetimeListChange]
    );

    const selectedDates = useMemo<IList<IYearMonthDate>>(
      () => datetimeList.map((e) => e.ymd),
      [datetimeList]
    );

    const mostFrequentTimeRange = useMemo<ITimeRange>(
      () => getMostFrequentTimeRange(datetimeList),
      [datetimeList]
    );

    /* handlers */

    const onDatetimeRangeYmdChange = useCallback(
      (index: number, ymd: IYearMonthDate) => {
        dispatch({ type: 'ymd', index, ymd: ymd });
      },
      [dispatch]
    );

    const onDatetimeRangeStartChange = useCallback(
      (index: number, hm: IHoursMinutes) => {
        dispatch({ type: 'start', index, hm: hm });
      },
      [dispatch]
    );

    const onDatetimeRangeEndChange = useCallback(
      (index: number, hm: IHoursMinutes) => {
        dispatch({ type: 'end', index, hm: hm });
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
        datetimeRange: createIDatetimeRange({
          ymd: createIYearMonthDate(),
          timeRange: mostFrequentTimeRange,
        }),
      });
    }, [mostFrequentTimeRange, dispatch]);

    const onConfirmDeleteAll = useCallback(() => {
      dispatch({ type: 'deleteAll' });
    }, [dispatch]);

    const onSetTimesAtOneTimeClick = useCallback(
      (timeRange: ITimeRange) => {
        dispatch({ type: 'setTimeAtOneTime', timeRange });
      },
      [dispatch]
    );

    const onSortClick = useCallback(() => {
      dispatch({ type: 'sort' });
    }, [dispatch]);

    const onSelectedDatesChange = useCallback(
      (list: IList<IYearMonthDate>) => {
        dispatch({ type: 'fromCalendar', list, mostFrequentTimeRange });
      },
      [mostFrequentTimeRange, dispatch]
    );

    /* view values */

    const datetimeListWithHandler = useMemo(
      () =>
        datetimeList.map((datetimeRange, index) => ({
          id: index,
          datetimeRange,
          onYmdChange: (ymd: IYearMonthDate | undefined) => {
            onDatetimeRangeYmdChange(index, ymd ?? createIYearMonthDate());
          },
          onRangeStartChange: (hm: IHoursMinutes) => {
            onDatetimeRangeStartChange(index, hm);
          },
          onRangeEndChange: (hm: IHoursMinutes) => {
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

    return (
      <SelectDatetimeView
        selectedDates={selectedDates}
        onSelectedDatesChange={onSelectedDatesChange}
        datetimeSpecification={datetimeSpecification}
        onDatetimeSpecificationChange={onDatetimeSpecificationChange}
        datetimeListWithHandler={datetimeListWithHandler}
        onAddDatetimeClick={onAddDatetimeClick}
        onConfirmDeleteAll={onConfirmDeleteAll}
        setTimesPopoverInitialValue={mostFrequentTimeRange}
        onSetTimesPopoverSubmit={onSetTimesAtOneTimeClick}
        onSortClick={onSortClick}
      />
    );
  }
);
