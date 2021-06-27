import type { DayType, YearMonthDate } from '@noshiro/event-schedule-app-api';
import { memoNamed } from '@noshiro/react-utils';
import type { DeepReadonly } from '@noshiro/ts-utils';
import { useMemo } from 'react';
import { DatePickerDate } from './date-picker-day';

type Props = DeepReadonly<{
  week: readonly {
    ymd: YearMonthDate;
    selected: boolean;
    disabled: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }[];
  onClick: (ymd: YearMonthDate) => void;
}>;

export const Week = memoNamed<Props>('Week', ({ week, onClick }) => {
  const listWithHandler = useMemo(
    () =>
      week.map((d) => ({
        value: d,
        handler: () => {
          onClick(d.ymd);
        },
      })),
    [week, onClick]
  );

  return (
    <div className='DayPicker-Week' role='row'>
      {listWithHandler.map(({ value, handler }, idx) => (
        <DatePickerDate
          key={idx}
          ymd={value.ymd}
          onClick={handler}
          selected={value.selected}
          disabled={value.disabled}
          dayType={value.dayType}
          holidayJpName={value.holidayJpName}
        />
      ))}
    </div>
  );
});
