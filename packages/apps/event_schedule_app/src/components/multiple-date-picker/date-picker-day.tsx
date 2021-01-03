import { memoNamed } from '@mono/react-utils';
import React, { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
import { DayType } from '../../types/enum/day-type';
import { IYearMonthDate } from '../../types/record/base/year-month-date';

interface Props
  extends Readonly<{
    ymd: IYearMonthDate;
    onClick: () => void;
    selected: boolean;
    disabled: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }> {}

const noop = (): undefined => undefined;

export const DatePickerDate = memoNamed<Props>(
  'DatePickerDate',
  ({
    ymd,
    onClick,
    selected = false,
    disabled = false,
    dayType = 'normal',
    holidayJpName,
  }) => {
    const dateString = useMemo<string>(
      () => new Date(ymd.year, ymd.month - 1, ymd.date).toString(),
      [ymd]
    );

    const className: string = `DayPicker-Day ${
      selected ? 'DayPicker-Day--selected' : ''
    } ${disabled ? 'DayPicker-Day--outside' : ''}`;

    const style = useMemo<CSSProperties>(() => {
      if (selected || disabled) return {};
      switch (dayType) {
        case 'holiday':
        case 'Sunday':
          return { color: 'red' };
        case 'Saturday':
          return { color: 'blue' };
        case 'normal':
        default:
          return {};
      }
    }, [dayType, selected, disabled]);

    return (
      <Cell
        className={className}
        tabIndex={-1}
        role='gridcell'
        aria-label={dateString}
        aria-disabled={disabled}
        aria-selected={selected}
        onClick={disabled ? noop : onClick}
        title={holidayJpName}
      >
        <div className='bp3-datepicker-day-wrapper' style={style}>
          {ymd.date}
        </div>
      </Cell>
    );
  }
);

const Cell = styled.div`
  outline: none;
`;
