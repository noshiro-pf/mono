import { DateInput, IDateInputProps } from '@blueprintjs/datetime';
import { memoNamed } from '@mono/react-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@mono/ts-utils';
import React, { useCallback, useMemo } from 'react';
import { IHoursMinutes } from '../../../types/record/hours-minutes';
import { IYearMonthDate } from '../../../types/record/year-month-date';
import { IYmdHm, IYmdHmType } from '../../../types/record/ymd-hm';

const dateFormatter = (date: Date): string =>
  `${getYear(date)}-${getMonth(date).toString().padStart(2, '0')}-${getDate(
    date
  )
    .toString()
    .padStart(2, '0')}  ${getHours(date)
    .toString()
    .padStart(2, '0')}:${getMinutes(date).toString().padStart(2, '0')}`;

const dateParser = (str: string): Date => new Date(str);

const defaultDatetime = IYmdHm();
const defaultDateObj = new Date(
  `${defaultDatetime.ymd.year}/${defaultDatetime.ymd.month}/${defaultDatetime.ymd.date} ${defaultDatetime.hm.hours}:${defaultDatetime.hm.minutes}:00`
);

const tenYearsLater = new Date(new Date().getFullYear() + 99, 11);

interface Props
  extends Omit<IDateInputProps, 'formatDate' | 'parseDate' | 'timePrecision'> {
  ymdhm: IYmdHmType | undefined;
  onYmdHmChange: (ymdhm: IYmdHmType | undefined) => void;
}

export const BpDatetimePicker = memoNamed<Props>(
  'BpDatetimePicker',
  ({
    ymdhm,
    onYmdHmChange,
    placeholder = 'YYYY-MM-DD HH:mm',
    showActionsBar = true,
    canClearSelection = false,
    shortcuts = false,
    reverseMonthAndYearMenus = true,
    maxDate = tenYearsLater,
    ...props
  }) => {
    const onChangeHandler = useCallback(
      (dt: Date | null | undefined, isUserChange: boolean) => {
        if (dt == null) {
          onYmdHmChange(undefined);
          return;
        }
        if (!isUserChange) return;
        const y = getYear(dt ?? defaultDateObj);
        const m = getMonth(dt ?? defaultDateObj);
        const d = getDate(dt ?? defaultDateObj);
        const h = getHours(dt ?? defaultDateObj);
        const min = getMinutes(dt ?? defaultDateObj);
        const ymdhmFromDate = IYmdHm({
          ymd: IYearMonthDate({ year: y, month: m, date: d }),
          hm: IHoursMinutes({ hours: h, minutes: min }),
        });
        onYmdHmChange(ymdhmFromDate);
      },
      [onYmdHmChange]
    );

    const dateObj = useMemo<undefined | Date>(
      () =>
        ymdhm === undefined
          ? undefined
          : new Date(
              `${ymdhm.ymd.year}/${ymdhm.ymd.month}/${ymdhm.ymd.date} ${ymdhm.hm.hours}:${ymdhm.hm.minutes}:00`
            ),
      [ymdhm]
    );

    return (
      <DateInput
        value={dateObj}
        formatDate={dateFormatter}
        parseDate={dateParser}
        onChange={onChangeHandler}
        placeholder={placeholder}
        showActionsBar={showActionsBar}
        canClearSelection={canClearSelection}
        shortcuts={shortcuts}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        maxDate={maxDate}
        timePrecision={'minute'}
        {...props}
      />
    );
  }
);
