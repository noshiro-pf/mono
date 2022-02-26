import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { DatePickerWeekStyled } from '../bp';
import { DatePickerDate } from './date-picker-day';

type Props = Readonly<{
  week: readonly Readonly<{
    ymd: YearMonthDate;
    selected: boolean;
    outside: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }>[];
  useOutlinedSelectedStyle?: boolean;
  onClick?: (ymd: YearMonthDate) => void;
}>;

export const Week = memoNamed<Props>(
  'Week',
  ({ week, useOutlinedSelectedStyle, onClick }) => {
    const listWithHandler = useMemo(
      () =>
        week.map((d, index) => ({
          value: d,
          index,
          handler:
            onClick === undefined
              ? undefined
              : () => {
                  onClick(d.ymd);
                },
        })),
      [week, onClick]
    );

    return (
      <DatePickerWeekStyled role='row'>
        {listWithHandler.map(({ value, handler, index }) => (
          <DatePickerDate
            key={index}
            dayType={value.dayType}
            holidayJpName={value.holidayJpName}
            outside={value.outside}
            selected={value.selected}
            useOutlinedSelectedStyle={useOutlinedSelectedStyle}
            ymd={value.ymd}
            onClick={handler}
          />
        ))}
      </DatePickerWeekStyled>
    );
  }
);
