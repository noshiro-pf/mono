import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import { DayType } from '../../types/enum/day-type';
import { IYearMonthDate } from '../../types/record/base/year-month-date';
import { IList } from '../../utils/immutable';
import { DatePickerDate } from './date-picker-day';

interface Props {
  week: IList<{
    ymd: IYearMonthDate;
    selected: boolean;
    disabled: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }>;
  onClick: (ymd: IYearMonthDate) => void;
}

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
