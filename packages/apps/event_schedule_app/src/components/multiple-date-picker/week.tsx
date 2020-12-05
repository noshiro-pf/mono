import { memoNamed } from '@mono/react-utils';
import { Mappable } from '@mono/ts-utils';
import React, { useMemo } from 'react';
import { IYearMonthDate } from '../../types/record/base/year-month-date';
import { DatePickerDate } from './date-picker-day';

interface Props {
  week: Readonly<
    Mappable<{
      ymd: IYearMonthDate;
      selected?: boolean | undefined;
      disabled?: boolean | undefined;
    }>
  >;
  onClick: (ymd: IYearMonthDate) => void;
}

export const Week = memoNamed<Props>('Week', ({ week, onClick }) => {
  const listWithHandler = useMemo(
    () =>
      week.map((d) => ({
        value: d,
        handler: () => onClick(d.ymd),
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
        />
      ))}
    </div>
  );
});
