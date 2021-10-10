import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { DatePickerWeek } from '../bp';
import { DatePickerDate } from './date-picker-day';

type Props = Readonly<{
  week: readonly Readonly<{
    ymd: YearMonthDate;
    selected: boolean;
    outside: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }>[];
  onClick?: (ymd: YearMonthDate) => void;
}>;

export const Week = memoNamed<Props>('Week', ({ week, onClick }) => {
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
    <DatePickerWeek role='row'>
      {listWithHandler.map(({ value, handler, index }) => (
        <DatePickerDate
          key={index}
          dayType={value.dayType}
          holidayJpName={value.holidayJpName}
          outside={value.outside}
          selected={value.selected}
          ymd={value.ymd}
          onClick={handler}
        />
      ))}
    </DatePickerWeek>
  );
});
