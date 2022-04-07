import { Button } from '@blueprintjs/core';
import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import type { Observable } from '@noshiro/syncflow';
import styled from 'styled-components';
import type { CalendarCurrentPageReducerState, YmdKey } from '../../functions';
import { useMultipleDatePickerState } from '../../hooks';
import {
  DatePickerBodyStyled,
  DatePickerMonthStyled,
  DatePickerStyled,
  DayPickerStyled,
} from '../bp';
import { DatepickerNav } from './navigation';
import { Week } from './week';
import { WeekdaysHeader } from './weekdays-header';

type Props = Readonly<{
  selectedDates: readonly YearMonthDate[];
  onSelectedDatesChange?: (value: readonly YearMonthDate[]) => void;
  setYearMonth$?: Observable<CalendarCurrentPageReducerState>;
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
      holidaysJpDefinition
    );

    return (
      <div>
        <DatePickerStyled>
          <DayPickerStyled lang='en'>
            <CenteringWrapper tabIndex={0}>
              <DatepickerNav
                month={calendarCurrentPage.month}
                year={calendarCurrentPage.year}
                onMonthChange={onMonthChange}
                onNextMonthClick={onNextMonthClick}
                onPrevMonthClick={onPrevMonthClick}
                onYearChange={onYearChange}
              />
              <DatePickerMonthStyled role='grid'>
                <WeekdaysHeader onClick={onWeekdaysHeaderCellClick} />
                <DatePickerBodyStyled role='rowgroup'>
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
            </CenteringWrapper>
          </DayPickerStyled>
        </DatePickerStyled>
        <TodayWrapper>
          <Button onClick={onTodayClick}>{'Today'}</Button>
        </TodayWrapper>
      </div>
    );
  }
);

const CenteringWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TodayWrapper = styled.div`
  display: flex;
  justify-content: center;
`;
