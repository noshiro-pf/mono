import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { IYearMonthDate } from '../../types/record/base/year-month-date';
import { IList, IMap } from '../../utils/immutable';
import { useMultipleDatePickerState } from './multiple-date-picker-hooks';
import { DatepickerNav } from './navigation';
import { Week } from './week';
import { WeekdaysHeader } from './weekdays-header';

type Props = Readonly<{
  selectedDates: IList<IYearMonthDate>;
  onSelectedDatesChange: (value: IList<IYearMonthDate>) => void;
  holidaysJpDefinition?: IMap<IYearMonthDate, string>;
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
