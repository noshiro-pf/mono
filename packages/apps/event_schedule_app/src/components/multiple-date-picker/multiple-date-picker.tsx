import { memoNamed } from '@mono/react-utils';
import { Mappable, MonthEnum, YearEnum } from '@mono/ts-utils';
import React, { useCallback, useMemo, useReducer } from 'react';
import styled from 'styled-components';
import { WeekdaysNumberEnum } from '../../types/enum/weekdays-number-enum';
import {
  compareYmd,
  createIYearMonthDate,
  IYearMonthDate,
} from '../../types/record/base/year-month-date';
import { IList, ISet } from '../../utils/immutable';
import { generateCalendar } from './generate-calendar';
import { DatepickerNav } from './navigation';
import {
  calendarCurrentPageInitialState,
  calendarCurrentPageReducer,
} from './reducers/calendar-reducer';
import {
  selectedDatesReducer,
  SelectedDatesReducerAction,
} from './reducers/selected-dates-reducer';
import { Week } from './week';
import { WeekdaysHeader } from './weekdays-header';

interface Props {
  selectedDates: IList<IYearMonthDate>;
  onSelectedDatesChange: (value: IList<IYearMonthDate>) => void;
}

export const MultipleDatePicker = memoNamed<Props>(
  'MultipleDatePicker',
  ({ selectedDates, onSelectedDatesChange }) => {
    /* states */

    const [calendarCurrentPage, calendarCurrentPageDispatch] = useReducer(
      calendarCurrentPageReducer,
      calendarCurrentPageInitialState
    );

    /* values */

    const selectedDatesSet = useMemo<ISet<IYearMonthDate>>(
      () => ISet(selectedDates),
      [selectedDates]
    );

    const dates = useMemo<IList<IList<IYearMonthDate>>>(
      () =>
        generateCalendar(calendarCurrentPage.year, calendarCurrentPage.month),
      [calendarCurrentPage]
    );

    const calendarCells = useMemo<
      Mappable<
        Mappable<{
          ymd: IYearMonthDate;
          selected?: boolean;
          disabled?: boolean;
        }>
      >
    >(
      () =>
        dates.map((week) =>
          week.map((ymd) => ({
            ymd,
            selected: selectedDatesSet.has(ymd),
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

    const selectedDatesDispatch = useCallback(
      (action: SelectedDatesReducerAction) => {
        onSelectedDatesChange(
          selectedDatesReducer(selectedDatesSet, action)
            .toList()
            .sort(compareYmd)
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
      (w: WeekdaysNumberEnum) => {
        selectedDatesDispatch({
          type: 'fill-column',
          dates: dates
            .map((week) => week.get(w) ?? createIYearMonthDate())
            .filter((d) => d?.month === calendarCurrentPage.month),
        });
      },
      [selectedDatesDispatch, dates, calendarCurrentPage.month]
    );

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

const CenteringWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
