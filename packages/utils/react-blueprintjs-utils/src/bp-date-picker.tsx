import type { HTMLInputProps, InputGroupProps2 } from '@blueprintjs/core';
import type { DatePickerShortcut } from '@blueprintjs/datetime';
import { DateInput } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { IDate, pipe } from '@noshiro/ts-utils';
import type { ComponentProps } from 'react';
import { useCallback, useMemo } from 'react';
import type { YearMonthDate } from './types';

// eslint-disable-next-line @typescript-eslint/ban-types
const formatDate = (date: ReadonlyDate): string => date.toLocaleDateString();

// eslint-disable-next-line @typescript-eslint/ban-types
const parseDate = (str: string): Date => new Date(str);

const inputProps: HTMLInputProps & InputGroupProps2 = {
  style: { width: '90px' },
};

const tenYearsLater = pipe(IDate.today())
  .chain(IDate.updateLocaleYear((a) => a + 99))
  .chain(IDate.setLocaleMonth(12))
  .chain(IDate.toDate).value;

type DateInputPropsOriginal = ComponentProps<typeof DateInput>;

export type BpDatePickerProps = Readonly<{
  ymd: YearMonthDate | undefined;
  onYmdChange: (ymd: YearMonthDate | undefined) => void;
  shortcuts?: boolean | readonly DatePickerShortcut[];
}> &
  StrictOmit<
    DateInputPropsOriginal,
    'formatDate' | 'parseDate' | 'shortcuts' | 'timePrecision'
  >;

export const BpDatePicker = memoNamed<BpDatePickerProps>(
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
      // eslint-disable-next-line @typescript-eslint/ban-types
      (dt: ReadonlyDate | null | undefined, isUserChange: boolean) => {
        if (dt == null) {
          onYmdChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdChange({
          year: IDate.getLocaleYear(dt),
          month: IDate.getLocaleMonth(dt),
          date: IDate.getLocaleDate(dt),
        });
      },
      [onYmdChange]
    );

    // eslint-disable-next-line @typescript-eslint/ban-types
    const dateObj = useMemo<Date | undefined>(
      () =>
        ymd === undefined
          ? undefined
          : new Date(`${ymd.year}/${ymd.month}/${ymd.date} 12:34:56`),
      [ymd]
    );

    return (
      <DateInput
        canClearSelection={canClearSelection}
        formatDate={formatDate}
        inputProps={inputProps}
        maxDate={maxDate}
        parseDate={parseDate}
        placeholder={placeholder}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        shortcuts={shortcuts as Writable<typeof shortcuts>}
        showActionsBar={showActionsBar}
        timePrecision={undefined}
        value={dateObj}
        onChange={onChangeHandler}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);
