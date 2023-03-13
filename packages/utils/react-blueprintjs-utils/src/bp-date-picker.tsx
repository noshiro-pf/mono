import { type HTMLInputProps, type InputGroupProps2 } from '@blueprintjs/core';
import { DateInput, type DatePickerShortcut } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { DateUtils, pipe } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import { type YearMonthDate } from './types';

const formatDate = (date: RawDateType): string => date.toLocaleDateString();

const parseDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

const inputProps: HTMLInputProps & InputGroupProps2 = {
  style: { width: '90px' },
};

const tenYearsLater = pipe(DateUtils.today())
  .chain(DateUtils.updateLocaleYear((a) => (a + 99) as YearEnum))
  .chain(DateUtils.setLocaleMonth(12))
  .chain(DateUtils.toDate).value;

// eslint-disable-next-line deprecation/deprecation
type DateInputPropsOriginal = React.ComponentProps<typeof DateInput>;

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
      (dt: RawDateType | null | undefined, isUserChange: boolean) => {
        if (dt == null) {
          onYmdChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdChange({
          year: DateUtils.getLocaleYear(dt),
          month: DateUtils.getLocaleMonth(dt),
          date: DateUtils.getLocaleDate(dt),
        });
      },
      [onYmdChange]
    );

    const dateObj = useMemo<RawDateType | undefined>(
      () =>
        ymd === undefined
          ? undefined
          : pipe(
              DateUtils.from(`${ymd.year}/${ymd.month}/${ymd.date} 12:34:56`)
            ).chain(DateUtils.toDate).value,
      [ymd]
    );

    return (
      // eslint-disable-next-line deprecation/deprecation
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
