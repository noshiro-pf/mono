import { memoNamed } from '@mono/react-utils';
import React, { useMemo } from 'react';
import { IYearMonthDateType } from '../../types/record/year-month-date';
import { IList } from '../../utils/immutable';
import { DatePickerDate } from './date-picker-day';

export const Week = memoNamed<{
  week: IList<{
    ymd: IYearMonthDateType;
    selected?: boolean | undefined;
    disabled?: boolean | undefined;
  }>;
  onClick: (ymd: IYearMonthDateType) => void;
}>('Week', ({ week, onClick }) => {
  const listWithHandler = useMemo(
    () => week.map((d) => ({ value: d, handler: () => onClick(d.ymd) })),
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
