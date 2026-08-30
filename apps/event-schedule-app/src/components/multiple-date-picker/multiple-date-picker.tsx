import { Button } from '@blueprintjs/core';
import { css } from '@emotion/react';
import {
  DatePickerBodyStyled,
  DatePickerMonthStyled,
  DatePickerStyled,
  DayPickerStyled,
} from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { type Observable as SynstateObservable } from 'synstate';
import { type IMapMapped } from 'ts-data-forge';
import {
  type CalendarCurrentPageReducerState,
  type YmdKey,
} from '../../functions/index.mjs';
import { useMultipleDatePickerState } from '../../hooks/index.mjs';
import { DatepickerNav } from './navigation.js';
import { Week } from './week.js';
import { WeekdaysHeader } from './weekdays-header.js';

type Props = Readonly<{
  selectedDates: readonly YearMonthDate[];
  onSelectedDatesChange?: (value: readonly YearMonthDate[]) => void;
  setYearMonth$?: SynstateObservable<CalendarCurrentPageReducerState>;
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>;
  useOutlinedSelectedStyle?: boolean;
}>;

export const MultipleDatePicker = memoNamed<Props>(
  'MultipleDatePicker',
  ({
    selectedDates,
    onSelectedDatesChange,
    setYearMonth$,
    holidaysJpDefinition,
    useOutlinedSelectedStyle,
  }) => {
    const {
      calendarCurrentPage,
      onPrevMonthClick,
      onNextMonthClick,
      onYearChange,
      onMonthChange,
      onWeekdaysHeaderCellClick,
      calendarCells,
      onDateClick,
      onTodayClick,
    } = useMultipleDatePickerState(
      selectedDates,
      onSelectedDatesChange,
      setYearMonth$,
      holidaysJpDefinition,
    );

    return (
      <div>
        <DatePickerStyled>
          <DayPickerStyled lang={'en'}>
            <div
              css={css`
                display: flex;
                flex-direction: column;
                align-items: center;
              `}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              <DatepickerNav
                month={calendarCurrentPage.month}
                year={calendarCurrentPage.year}
                onMonthChange={onMonthChange}
                onNextMonthClick={onNextMonthClick}
                onPrevMonthClick={onPrevMonthClick}
                onYearChange={onYearChange}
              />
              <DatePickerMonthStyled role={'grid'}>
                <WeekdaysHeader onClick={onWeekdaysHeaderCellClick} />
                {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
                <DatePickerBodyStyled role={'rowgroup'}>
                  {calendarCells.map((week) => (
                    <Week
                      key={week.index}
                      useOutlinedSelectedStyle={useOutlinedSelectedStyle}
                      week={week.week}
                      onClick={onDateClick}
                    />
                  ))}
                </DatePickerBodyStyled>
              </DatePickerMonthStyled>
            </div>
          </DayPickerStyled>
        </DatePickerStyled>
        <div
          css={css`
            display: flex;
            justify-content: center;
          `}
        >
          <Button onClick={onTodayClick}>{'Today'}</Button>
        </div>
      </div>
    );
  },
);
