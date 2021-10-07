import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { DatePickerDate } from './date-picker-day';

type Props = Readonly<{
  week: readonly Readonly<{
    ymd: YearMonthDate;
    selected: boolean;
    disabled: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }>[];
  onClick: (ymd: YearMonthDate) => void;
}>;

export const Week = memoNamed<Props>('Week', ({ week, onClick }) => {
  const listWithHandler = useMemo(
    () =>
      week.map((d, index) => ({
        value: d,
        index,
        handler: () => {
          onClick(d.ymd);
        },
      })),
    [week, onClick]
  );

  return (
    <div className='DayPicker-Week' role='row'>
      {listWithHandler.map(({ value, handler, index }) => (
        <DatePickerDate
          key={index}
          dayType={value.dayType}
          disabled={value.disabled}
          holidayJpName={value.holidayJpName}
          selected={value.selected}
          ymd={value.ymd}
          onClick={handler}
        />
      ))}
    </div>
  );
});
