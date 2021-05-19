import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import type { DayType, IYearMonthDate } from '../../types';
import type { IList } from '../../utils';
import { DatePickerDate } from './date-picker-day';

type Props = Readonly<{
  week: IList<
    Readonly<{
      ymd: IYearMonthDate;
      selected: boolean;
      disabled: boolean;
      dayType: DayType;
      holidayJpName: string | undefined;
    }>
  >;
  onClick: (ymd: IYearMonthDate) => void;
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
