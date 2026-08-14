import * as React from 'react';
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
} from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { DateUtils } from 'ts-fortress-types';
import { match, noop } from '../../utils-ported/index.mjs';

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
    selected,
    outside,
    useOutlinedSelectedStyle = false,
    dayType,
    holidayJpName,
  }) => {
    const dateString = React.useMemo<string>(
      () => DateUtils.create(ymd.year, ymd.month, ymd.date).toString(),
      [ymd],
    );

    const DatePickerDayResolved = React.useMemo(() => {
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
      }

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
    }, [dayType, onClick, selected, outside, useOutlinedSelectedStyle]);

    return (
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      <DatePickerDayResolved
        aria-disabled={outside}
        aria-label={dateString}
        aria-selected={selected}
        role={'gridcell'}
        tabIndex={-1}
        title={holidayJpName}
        onClick={outside ? noop : onClick}
      >
        <DatePickerDayWrapperStyled>{ymd.date}</DatePickerDayWrapperStyled>
      </DatePickerDayResolved>
    );
  },
);
