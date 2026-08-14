import { type HTMLInputProps, type InputGroupProps } from '@blueprintjs/core';
import { DateInput, type DatePickerShortcut } from '@blueprintjs/datetime';
import { DateUtils, type YearMonthDate } from 'io-ts-types';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { asSafeUint, castMutable, pipe } from 'ts-data-forge';
import { type SafeUint, type StrictOmit } from 'ts-type-forge';
import { mapOptional } from '../../utils/index.mjs';

export type BpDatePickerProps = StrictOmit<
  DateInputPropsOriginal,
  'formatDate' | 'parseDate' | 'shortcuts' | 'timePrecision'
> &
  Readonly<{
    ymd: YearMonthDate | undefined;
    onYmdChange: (ymd: YearMonthDate | undefined) => void;
    shortcuts?: boolean | readonly DatePickerShortcut[];
  }>;

type DateInputPropsOriginal = React.ComponentProps<typeof DateInput>;

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
    const onChangeHandler = React.useCallback(
      (dateStr: string | null, isUserChange?: boolean) => {
        if (dateStr == null) {
          onYmdChange(undefined);

          return;
        }

        if (isUserChange !== true) return;

        const dt = decodeDate(dateStr);

        onYmdChange({
          year: DateUtils.getLocaleYear(dt),
          month: DateUtils.getLocaleMonth(dt),
          date: DateUtils.getLocaleDate(dt),
        });
      },
      [onYmdChange],
    );

    const date = React.useMemo<string | undefined>(
      () =>
        mapOptional(ymd, (a) =>
          DateUtils.from(
            `${a.year}/${a.month}/${a.date} 12:34:56`,
          ).toISOString(),
        ),
      [ymd],
    );

    return (
      <DateInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        canClearSelection={canClearSelection}
        formatDate={encodeDate}
        inputProps={inputProps}
        maxDate={maxDate}
        parseDate={decodeDate}
        placeholder={placeholder}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        shortcuts={castMutable(shortcuts)}
        showActionsBar={showActionsBar}
        timePrecision={undefined}
        value={date}
        onChange={onChangeHandler}
      />
    );
  },
);

const encodeDate = (date: Date): string => date.toLocaleDateString();

const decodeDate = (str: string): Date =>
  pipe(DateUtils.from(str)).map(DateUtils.toDate).value;

const inputProps: HTMLInputProps & InputGroupProps = {
  style: { width: '90px' },
} as const;

const tenYearsLater = pipe(DateUtils.today())
  .map(DateUtils.updateLocaleYear((y) => asSafeUint(y + 99) satisfies SafeUint))
  .map(DateUtils.setLocaleMonth(12))
  .map(DateUtils.toDate).value;
