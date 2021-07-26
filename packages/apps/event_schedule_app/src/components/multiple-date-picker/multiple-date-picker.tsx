import type { YearMonthDate } from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { IMapMapped } from '@noshiro/ts-utils';
import styled from 'styled-components';
import type { YmdKey } from '../../functions';
import { useMultipleDatePickerState } from './multiple-date-picker-hooks';
import { DatepickerNav } from './navigation';
import { Week } from './week';
import { WeekdaysHeader } from './weekdays-header';

type Props = Readonly<{
  selectedDates: readonly YearMonthDate[];
  onSelectedDatesChange: (value: readonly YearMonthDate[]) => void;
  holidaysJpDefinition?: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const MultipleDatePicker = memoNamed<Props>(
  'MultipleDatePicker',
  ({ selectedDates, onSelectedDatesChange, holidaysJpDefinition }) => {
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
      holidaysJpDefinition
    );

    return (
      <div>
        <div className='bp3-datepicker'>
          <div className='DayPicker' lang='en'>
            <CenteringWrapper
              // eslint-disable-next-line react/forbid-component-props
              className={'DayPicker-wrapper'}
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
