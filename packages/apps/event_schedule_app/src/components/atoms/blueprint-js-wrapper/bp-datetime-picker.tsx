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
import { createIHoursMinutes } from '../../../types/record/base/hours-minutes';
import { createIYearMonthDate } from '../../../types/record/base/year-month-date';
import { createIYmdHm, IYmdHm } from '../../../types/record/ymd-hm';
import { pad2 } from '../../../utils/pad2';
import { ymdhm2Date } from '../../../utils/ymdhm2date';

const dateFormatter = (date: Date): string =>
  `${getYear(date)}-${pad2(getMonth(date))}-${pad2(getDate(date))}  ${pad2(
    getHours(date)
  )}:${pad2(getMinutes(date))}`;

const dateParser = (str: string): Date => new Date(str);

const defaultDateObj = ymdhm2Date(createIYmdHm());

const tenYearsLater = new Date(new Date().getFullYear() + 99, 11);

interface Props
  extends Omit<IDateInputProps, 'formatDate' | 'parseDate' | 'timePrecision'> {
  ymdhm: IYmdHm | undefined;
  onYmdHmChange: (ymdhm: IYmdHm | undefined) => void;
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
        const ymdhmFromDate = createIYmdHm({
          ymd: createIYearMonthDate({ year: y, month: m, date: d }),
          hm: createIHoursMinutes({ hours: h, minutes: min }),
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
