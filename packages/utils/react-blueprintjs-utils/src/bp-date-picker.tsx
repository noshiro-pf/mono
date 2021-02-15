import { HTMLInputProps, IInputGroupProps2 } from '@blueprintjs/core';
import { DateInput, IDateInputProps } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { getDate, getMonth, getYear } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { YearMonthDate } from './types/year-month-date';

const formatDate = (date: Date): string => date.toLocaleDateString();
const parseDate = (str: string): Date => new Date(str);

const inputProps: HTMLInputProps & IInputGroupProps2 = {
  style: { width: '90px' },
};

const tenYearsLater = new Date(getYear(new Date()) + 99, 11);

type Props = Omit<
  IDateInputProps,
  'formatDate' | 'parseDate' | 'timePrecision'
> &
  Readonly<{
    ymd: YearMonthDate | undefined;
    onYmdChange: (ymd: YearMonthDate | undefined) => void;
  }>;

export const BpDatePicker = memoNamed<Props>(
  'BpDatePicker',
  ({
    ymd,
    onYmdChange,
    placeholder = 'yyyy-mm-dd',
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
          onYmdChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdChange({
          year: getYear(dt),
          month: getMonth(dt),
          date: getDate(dt),
        });
      },
      [onYmdChange]
    );

    const dateObj = useMemo<undefined | Date>(
      () =>
        ymd === undefined
          ? undefined
          : new Date(`${ymd.year}/${ymd.month}/${ymd.date} 12:34:56`),
      [ymd]
    );

    return (
      <DateInput
        inputProps={inputProps}
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
        timePrecision={undefined}
        {...props}
      />
    );
  }
);
