import { HTMLInputProps, IInputGroupProps } from '@blueprintjs/core';
import { DateInput, IDateInputProps } from '@blueprintjs/datetime';
import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useMemo } from 'react';
import {
  IYearMonthDate,
  IYearMonthDateType,
} from '../../../types/record/year-month-date';
import { getDate } from '../../../utils/datetime/functions/date-method-wrapper/date';
import { getMonth } from '../../../utils/datetime/functions/date-method-wrapper/month';
import { getYear } from '../../../utils/datetime/functions/date-method-wrapper/year';

const dateFormatter = (date: Date): string => date.toLocaleDateString();
const dateParser = (str: string): Date => new Date(str);

const defaultDate = IYearMonthDate();

const defaultDateObj = new Date(
  `${defaultDate.year}/${defaultDate.month}/${defaultDate.date} 00:00:00`
);

const inputProps: HTMLInputProps & IInputGroupProps = {
  style: { width: '90px' },
};

const tenYearsLater = new Date(new Date().getFullYear() + 99, 11);

interface Props
  extends Omit<IDateInputProps, 'formatDate' | 'parseDate' | 'timePrecision'> {
  ymd: IYearMonthDateType | undefined;
  onYmdChange: (ymd: IYearMonthDateType | undefined) => void;
}

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
        const y = getYear(dt ?? defaultDateObj);
        const m = getMonth(dt ?? defaultDateObj);
        const d = getDate(dt ?? defaultDateObj);
        const ymdFromDate = IYearMonthDate({ year: y, month: m, date: d });
        onYmdChange(ymdFromDate);
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
        formatDate={dateFormatter}
        parseDate={dateParser}
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
