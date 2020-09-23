import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import styled from 'styled-components';
import {
  compareYmd,
  IYearMonthDate,
  IYearMonthDateType,
} from '../../types/record/year-month-date';
import { WeekdaysNumberEnum } from '../../utils/datetime/constants/weekdays';
import { MonthEnum } from '../../utils/datetime/types/month';
import { YearEnum } from '../../utils/datetime/types/year';
import { ForciblyUpdatedValue } from '../../utils/forcibly-updated-value';
import { IList } from '../../utils/immutable';
import { generateCalendar } from './generate-calendar';
import { DatepickerNav } from './navigation';
import {
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
} from './reducers/calendar-reducer';
import {
  selectedDatesReducer,
  selectedDatesReducerInitialState,
} from './reducers/selected-dates-reducer';
import { Week } from './week';
import { WeekdaysHeader } from './weekdays-header';

const CenteringWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const MultipleDatePicker = memoNamed<{
  selectedDates: ForciblyUpdatedValue<IList<IYearMonthDateType>>;
  onSelectedDatesChange: (value: IList<IYearMonthDateType>) => void;
}>(
  'MultipleDatePicker',
  ({ selectedDates: selectedDatesInput, onSelectedDatesChange }) => {
    /* states */

    const [calendarCurrentPage, calendarCurrentPageDispatch] = useReducer(
      calendarCurrentPageReducer,
      calendarCurrentPageInitialState
    );

    const [selectedDatesSet, selectedDatesDispatch] = useReducer(
      selectedDatesReducer,
      selectedDatesReducerInitialState
    );

    /* from props */

    useEffect(() => {
      selectedDatesDispatch({
        type: 'fromProps',
        dates: selectedDatesInput.value,
      });
    }, [selectedDatesInput]);

    /* values */

    const dates = useMemo<IList<IList<IYearMonthDateType>>>(
      () =>
        generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
      [calendarCurrentPage]
    );

    const calendarCells = useMemo<
      IList<
        IList<{
          ymd: IYearMonthDateType;
          selected?: boolean;
          disabled?: boolean;
        }>
      >
    >(
      () =>
        dates.map((week) =>
          week.map((ymd) => ({
            ymd,
            selected: selectedDatesSet.value.has(ymd),
            disabled: ymd.month !== calendarCurrentPage.month,
          }))
        ),
      [dates, selectedDatesSet, calendarCurrentPage]
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

    const onDateClick = useCallback((ymd: IYearMonthDateType) => {
      selectedDatesDispatch({ type: 'flip', dateToFlip: ymd });
    }, []);

    const onWeekdaysHeaderCellClick = useCallback(
      (w: WeekdaysNumberEnum) => {
        selectedDatesDispatch({
          type: 'fill-column',
          dates: dates
            .map((week) => week.get(w) ?? IYearMonthDate())
            .filter((d) => d?.month === calendarCurrentPage.month),
        });
      },
      [dates, calendarCurrentPage]
    );

    /* callbacks */

    useEffect(() => {
      if (selectedDatesSet.lastAction !== 'fromProps') {
        onSelectedDatesChange(selectedDatesSet.value.toList().sort(compareYmd));
      }
    }, [selectedDatesSet, onSelectedDatesChange]);

    return (
      <>
        <div className='bp3-datepicker'>
          <div className='DayPicker' lang='en'>
            <CenteringWrapper className='DayPicker-wrapper' tabIndex={0}>
              <DatepickerNav
                year={calendarCurrentPage.year}
                month={calendarCurrentPage.month}
                onPrevMonthClick={onPrevMonthClick}
                onNextMonthClick={onNextMonthClick}
                onYearChange={onYearChange}
                onMonthChange={onMonthChange}
              />
              <div className='DayPicker-Months'>
                <div className='DayPicker-Month' role='grid'>
                  <WeekdaysHeader onClick={onWeekdaysHeaderCellClick} />
                  <div className='DayPicker-Body' role='rowgroup'>
                    {calendarCells.map((week, idx) => (
                      <Week key={idx} week={week} onClick={onDateClick} />
                    ))}
                  </div>
                </div>
              </div>
            </CenteringWrapper>
          </div>
        </div>
      </>
    );
  }
);
