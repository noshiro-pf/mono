import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { Observable } from '@noshiro/syncflow';
import type { IMapMapped } from '@noshiro/ts-utils';
import styled from 'styled-components';
import type { CalendarCurrentPageReducerState, YmdKey } from '../../functions';
import { useMultipleDatePickerState } from '../../hooks';
import {
  Bp3DatePicker,
  DatePickerBody,
  DatePickerMonth,
  DayPicker,
} from '../bp';
import { DatepickerNav } from './navigation';
import { Week } from './week';
import { WeekdaysHeader } from './weekdays-header';

type Props = Readonly<{
  selectedDates: readonly YearMonthDate[];
  onSelectedDatesChange?: (value: readonly YearMonthDate[]) => void;
  setYearMonth$?: Observable<CalendarCurrentPageReducerState>;
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const MultipleDatePicker = memoNamed<Props>(
  'MultipleDatePicker',
  ({
    selectedDates,
    onSelectedDatesChange,
    setYearMonth$,
    holidaysJpDefinition,
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
        <Bp3DatePicker>
          <DayPicker lang='en'>
            <CenteringWrapper tabIndex={0}>
              <DatepickerNav
                month={calendarCurrentPage.month}
                year={calendarCurrentPage.year}
                onMonthChange={onMonthChange}
                onNextMonthClick={onNextMonthClick}
                onPrevMonthClick={onPrevMonthClick}
                onYearChange={onYearChange}
              />
              <DatePickerMonth role='grid'>
                <WeekdaysHeader onClick={onWeekdaysHeaderCellClick} />
                <DatePickerBody role='rowgroup'>
                  {calendarCells.map((week) => (
                    <Week
                      key={week.index}
                      week={week.week}
                      onClick={onDateClick}
                    />
                  ))}
                </DatePickerBody>
              </DatePickerMonth>
            </CenteringWrapper>
          </DayPicker>
        </Bp3DatePicker>
        <TodayWrapper>
          <BpButton onClick={onTodayClick}>{'Today'}</BpButton>
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
