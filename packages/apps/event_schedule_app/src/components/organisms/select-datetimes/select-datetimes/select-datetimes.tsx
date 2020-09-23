import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import {
  IDatetimeRange,
  IDatetimeRangeType,
} from '../../../../types/record/datetime-range';
import { IHoursMinutesType } from '../../../../types/record/hours-minutes';
import { ITimeRangeType } from '../../../../types/record/time-range';
import {
  IYearMonthDate,
  IYearMonthDateType,
} from '../../../../types/record/year-month-date';
import {
  ForciblyUpdatedValue,
  forciblyUpdatedValue,
} from '../../../../utils/forcibly-updated-value';
import { IList } from '../../../../utils/immutable';
import { getMostFrequentTimeRange } from './get-most-frequent-time-range';
import {
  datetimeListreducer,
  datetimeListReducerInitialState,
} from './select-datetimes-reducer';
import { SelectDatetimeView } from './select-datetimes-view';

export const SelectDatetimes = memoNamed<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeList: IList<IDatetimeRangeType>;
  onDatetimeListChange: (list: IList<IDatetimeRangeType>) => void;
}>(
  'SelectDatetimes',
  ({
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeList: datetimeListInput,
    onDatetimeListChange,
  }) => {
    /* states */

    const [
      // dummy comment to control prettier
      datetimeListState,
      dispatch,
    ] = useReducer(datetimeListreducer, datetimeListReducerInitialState);

    /* callbacks */

    useEffect(() => {
      if (datetimeListState.lastAction !== 'fromProps') {
        onDatetimeListChange(datetimeListState.value);
      }
    }, [onDatetimeListChange, datetimeListState]);

    /* from props */

    useEffect(() => {
      dispatch({ type: 'fromProps', list: datetimeListInput });
    }, [datetimeListInput]);

    /* values */
    const datetimeList: IList<IDatetimeRangeType> = datetimeListState.value;

    const selectedDates = useMemo<
      ForciblyUpdatedValue<IList<IYearMonthDateType>>
    >(() => forciblyUpdatedValue(datetimeList.map((e) => e.ymd)), [
      datetimeList,
    ]);

    const mostFrequentTimeRange = useMemo<ITimeRangeType>(
      () => getMostFrequentTimeRange(datetimeList),
      [datetimeList]
    );

    /* handlers */

    const onDatetimeRangeYmdChange = useCallback(
      (index: number, ymd: IYearMonthDateType) => {
        dispatch({ type: 'ymd', payload: { index, value: ymd } });
      },
      []
    );

    const onDatetimeRangeStartChange = useCallback(
      (index: number, hm: IHoursMinutesType) => {
        dispatch({ type: 'start', payload: { index, value: hm } });
      },
      []
    );

    const onDatetimeRangeEndChange = useCallback(
      (index: number, hm: IHoursMinutesType) => {
        dispatch({ type: 'end', payload: { index, value: hm } });
      },
      []
    );

    const onDeleteDatetimeClick = useCallback((index: number) => {
      dispatch({ type: 'delete', index });
    }, []);

    const onDuplicateDatetimeClick = useCallback((index: number) => {
      dispatch({ type: 'duplicate', index });
    }, []);

    const onAddDatetimeClick = useCallback(() => {
      dispatch({
        type: 'addClick',
        datetimeRange: IDatetimeRange({ timeRange: mostFrequentTimeRange }),
      });
    }, [mostFrequentTimeRange]);

    const onConfirmDeleteAll = useCallback(() => {
      dispatch({ type: 'deleteAll' });
    }, []);

    const onSetTimesAtOneTimeClick = useCallback(
      (timeRange: ITimeRangeType) => {
        dispatch({ type: 'setTimeAtOneTime', timeRange });
      },
      []
    );

    const onSortClick = useCallback(() => {
      dispatch({ type: 'sort' });
    }, []);

    const onSelectedDatesChange = useCallback(
      (list: IList<IYearMonthDateType>) => {
        dispatch({ type: 'fromCalendar', list, mostFrequentTimeRange });
      },
      [mostFrequentTimeRange]
    );

    /* view values */

    const datetimeListWithHandler = useMemo(
      () =>
        datetimeList.map((datetimeRange, index) => ({
          id: index,
          datetimeRange,
          onYmdChange: (ymd: IYearMonthDateType | undefined) => {
            onDatetimeRangeYmdChange(index, ymd ?? IYearMonthDate());
          },
          onRangeStartChange: (hm: IHoursMinutesType) => {
            onDatetimeRangeStartChange(index, hm);
          },
          onRangeEndChange: (hm: IHoursMinutesType) => {
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
