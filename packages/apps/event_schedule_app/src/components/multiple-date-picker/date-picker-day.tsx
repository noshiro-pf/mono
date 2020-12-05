import { memoNamed } from '@mono/react-utils';
import React, { useMemo } from 'react';
import { IYearMonthDate } from '../../types/record/base/year-month-date';

interface Props {
  ymd: IYearMonthDate;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export const DatePickerDate = memoNamed<Props>(
  'DatePickerDate',
  ({ ymd, onClick, selected = false, disabled = false }) => {
    const dateString = useMemo<string>(
      () => new Date(ymd.year, ymd.month - 1, ymd.date).toString(),
      [ymd]
    );

    const className = useMemo<string>(
      () =>
        `DayPicker-Day ${selected ? 'DayPicker-Day--selected' : ''} ${
          disabled ? 'DayPicker-Day--outside' : ''
        }`,
      [selected, disabled]
    );

    return (
      <div
        className={className}
        tabIndex={-1}
        role='gridcell'
        aria-label={dateString}
        aria-disabled={disabled}
        aria-selected={selected}
        onClick={onClick}
      >
        <div className='bp3-datepicker-day-wrapper'>{ymd.date}</div>
      </div>
    );
  }
);
