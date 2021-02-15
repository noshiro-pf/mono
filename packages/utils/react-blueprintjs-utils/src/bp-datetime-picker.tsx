import { DateInput, IDateInputProps } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { Ymdhm } from './types/ymdhm';

const pad2 = (n: number): string => n.toString().padStart(2, '0');
const formatDate = (date: Date): string =>
  `${getYear(date)}-${pad2(getMonth(date))}-${pad2(getDate(date))}  ${pad2(
    getHours(date)
  )}:${pad2(getMinutes(date))}`;
const parseDate = (str: string): Date => new Date(str);

const tenYearsLater = new Date(getYear(new Date()) + 99, 11);

type Props = Omit<
  IDateInputProps,
  'formatDate' | 'parseDate' | 'timePrecision'
> &
  Readonly<{
    ymdhm: Ymdhm | undefined;
    onYmdhmChange: (ymdhm: Ymdhm | undefined) => void;
  }>;

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

    const dateObj = useMemo<undefined | Date>(
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
        shortcuts={shortcuts}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        maxDate={maxDate}
        timePrecision={'minute'}
        {...props}
      />
    );
  }
);
