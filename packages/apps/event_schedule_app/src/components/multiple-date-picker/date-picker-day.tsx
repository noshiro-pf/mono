/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { noop } from '@noshiro/ts-utils';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import {
  DatePickerDayOutside,
  DatePickerDayReadonlyStyled,
  DatePickerDaySelectedReadonlyStyled,
  DatePickerDaySelectedStyled,
  DatePickerDayStyled,
  DatePickerDayWrapperStyled,
} from '../bp';

type Props = Readonly<{
  ymd: YearMonthDate;
  onClick?: () => void;
  selected: boolean;
  outside: boolean;
  dayType: DayType;
  holidayJpName: string | undefined;
}>;

export const DatePickerDate = memoNamed<Props>(
  'DatePickerDate',
  ({
    ymd,
    onClick,
    selected = false,
    outside = false,
    dayType = 'normal',
    holidayJpName,
  }) => {
    const dateString = useMemo<string>(
      () => new Date(ymd.year, ymd.month - 1, ymd.date).toString(),
      [ymd]
    );

    const DatePickerDayResolved =
      onClick === undefined
        ? selected
          ? DatePickerDaySelectedReadonlyStyled
          : outside
          ? DatePickerDayOutside
          : DatePickerDayReadonlyStyled
        : selected
        ? outside
          ? DatePickerDaySelectedReadonlyStyled
          : DatePickerDaySelectedStyled
        : outside
        ? DatePickerDayOutside
        : DatePickerDayStyled;

    const style = useMemo<CSSProperties>(() => {
      if (selected || outside) return {};
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
    }, [dayType, selected, outside]);

    return (
      <DatePickerDayResolved
        // eslint-disable-next-line react/forbid-component-props
        aria-disabled={outside}
        aria-label={dateString}
        aria-selected={selected}
        role='gridcell'
        tabIndex={-1}
        title={holidayJpName}
        onClick={outside ? noop : onClick}
      >
        <DatePickerDayWrapperStyled style={style}>
          {ymd.date}
        </DatePickerDayWrapperStyled>
      </DatePickerDayResolved>
    );
  }
);
