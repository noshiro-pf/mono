/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
  DayType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';
import {
  DatePickerDayHolidayStyled,
  DatePickerDayOutlinedSelectedReadonlyHolidayStyled,
  DatePickerDayOutlinedSelectedReadonlySaturdayStyled,
  DatePickerDayOutlinedSelectedReadonlyStyled,
  DatePickerDayOutside,
  DatePickerDayReadonlyHolidayStyled,
  DatePickerDayReadonlySaturdayStyled,
  DatePickerDayReadonlyStyled,
  DatePickerDaySaturdayStyled,
  DatePickerDaySelectedReadonlyStyled,
  DatePickerDaySelectedStyled,
  DatePickerDayStyled,
  DatePickerDayWrapperStyled,
} from '../bp';

type Props = Readonly<{
  ymd: YearMonthDate;
  onClick?: () => void;
  selected: boolean;
  useOutlinedSelectedStyle?: boolean;
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
    useOutlinedSelectedStyle = false,
    dayType = 'normal',
    holidayJpName,
  }) => {
    const dateString = useMemo<string>(
      () => IDate.create(ymd.year, ymd.month, ymd.date).toString(),
      [ymd]
    );

    const DatePickerDayResolved = useMemo(() => {
      if (onClick === undefined) {
        // readonly
        return selected
          ? useOutlinedSelectedStyle
            ? match(dayType, {
                holiday: DatePickerDayOutlinedSelectedReadonlyHolidayStyled,
                Sunday: DatePickerDayOutlinedSelectedReadonlyHolidayStyled,
                Saturday: DatePickerDayOutlinedSelectedReadonlySaturdayStyled,
                normal: DatePickerDayOutlinedSelectedReadonlyStyled,
              })
            : DatePickerDaySelectedReadonlyStyled
          : outside
          ? DatePickerDayOutside
          : match(dayType, {
              holiday: DatePickerDayReadonlyHolidayStyled,
              Sunday: DatePickerDayReadonlyHolidayStyled,
              Saturday: DatePickerDayReadonlySaturdayStyled,
              normal: DatePickerDayReadonlyStyled,
            });
      } else {
        // button
        return selected
          ? outside
            ? DatePickerDaySelectedReadonlyStyled
            : DatePickerDaySelectedStyled
          : outside
          ? DatePickerDayOutside
          : match(dayType, {
              holiday: DatePickerDayHolidayStyled,
              Sunday: DatePickerDayHolidayStyled,
              Saturday: DatePickerDaySaturdayStyled,
              normal: DatePickerDayStyled,
            });
      }
    }, [dayType, onClick, selected, outside, useOutlinedSelectedStyle]);

    return (
      <DatePickerDayResolved
        aria-disabled={outside}
        aria-label={dateString}
        aria-selected={selected}
        role='gridcell'
        tabIndex={-1}
        title={holidayJpName}
        onClick={outside ? noop : onClick}
      >
        <DatePickerDayWrapperStyled>{ymd.date}</DatePickerDayWrapperStyled>
      </DatePickerDayResolved>
    );
  }
);
