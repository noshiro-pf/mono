import { Button } from '@blueprintjs/core';
import {
  DatePickerBodyStyled,
  DatePickerMonthStyled,
  DatePickerStyled,
  DayPickerStyled,
} from '@noshiro/react-blueprintjs-utils';
import {
  type CalendarCurrentPageReducerState,
  type YmdKey,
} from '../../functions';
import { useMultipleDatePickerState } from '../../hooks';
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
      holidaysJpDefinition,
    );

    return (
      <div>
        <DatePickerStyled>
          <DayPickerStyled lang='en'>
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
              <DatePickerMonthStyled role='grid'>
                <WeekdaysHeader onClick={onWeekdaysHeaderCellClick} />
                {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
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
