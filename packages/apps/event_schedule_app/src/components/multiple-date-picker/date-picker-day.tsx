import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';

type Props = Readonly<{
  ymd: YearMonthDate;
  onClick: () => void;
  selected: boolean;
  disabled: boolean;
  dayType: DayType;
  holidayJpName: string | undefined;
}>;

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
        // eslint-disable-next-line react/forbid-component-props
        aria-disabled={disabled}
        aria-label={dateString}
        aria-selected={selected}
        // eslint-disable-next-line react/forbid-component-props
        className={className}
        role='gridcell'
        tabIndex={-1}
        title={holidayJpName}
        onClick={disabled ? noop : onClick}
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
