import type { DateInputProps, DatePickerShortcut } from '@blueprintjs/datetime';
import { DateInput } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import type { ReadonlyDate, StrictOmit, Writable } from '@noshiro/ts-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import type { Ymdhm } from './types';

const pad2 = (n: number): string => n.toString().padStart(2, '0');
const formatDate = (date: ReadonlyDate): string =>
  `${getYear(date)}-${pad2(getMonth(date))}-${pad2(getDate(date))}  ${pad2(
    getHours(date)
  )}:${pad2(getMinutes(date))}`;
const parseDate = (str: string): Date => new Date(str);

const tenYearsLater = new Date(getYear(new Date()) + 99, 11);

type Props = Readonly<{
  ymdhm: Ymdhm | undefined;
  onYmdhmChange: (ymdhm: Ymdhm | undefined) => void;
  shortcuts?: boolean | readonly DatePickerShortcut[];
}> &
  StrictOmit<
    DateInputProps,
    'formatDate' | 'parseDate' | 'shortcuts' | 'timePrecision'
  >;

export const BpDatetimePicker = memoNamed<Props>(
  'BpDatetimePicker',
  ({
    ymdhm,
    onYmdhmChange,
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
          onYmdhmChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdhmChange({
          year: getYear(dt),
          month: getMonth(dt),
          date: getDate(dt),
          hours: getHours(dt),
          minutes: getMinutes(dt),
        });
      },
      [onYmdhmChange]
    );

    const dateObj = useMemo<Date | undefined>(
      () =>
        ymdhm === undefined
          ? undefined
          : new Date(
              `${ymdhm.year}/${ymdhm.month}/${ymdhm.date} ${ymdhm.hours}:${ymdhm.minutes}:00`
            ),
      [ymdhm]
    );

    return (
      <DateInput
        value={dateObj}
        formatDate={formatDate}
        parseDate={parseDate}
        onChange={onChangeHandler}
        placeholder={placeholder}
        showActionsBar={showActionsBar}
        canClearSelection={canClearSelection}
        shortcuts={shortcuts as Writable<typeof shortcuts>}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        maxDate={maxDate}
        timePrecision={'minute'}
        {...props}
      />
    );
  }
);
