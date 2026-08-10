import { type HTMLInputProps, type InputGroupProps } from '@blueprintjs/core';
import { type DatePickerShortcut } from '@blueprintjs/datetime';
import { DateInput3 } from '@blueprintjs/datetime2';
import { type YearMonthDate } from '@noshiro/io-ts-types';
import { memoNamed } from '@noshiro/react-utils';
import {
  DateUtils,
  castMutable,
  mapOptional,
  pipe,
  toSafeUint,
} from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';

export type BpDatePickerProps = Omit<
  DateInputPropsOriginal,
  'formatDate' | 'parseDate' | 'shortcuts' | 'timePrecision'
> &
  Readonly<{
    ymd: YearMonthDate | undefined;
    onYmdChange: (ymd: YearMonthDate | undefined) => void;
    shortcuts?: boolean | readonly DatePickerShortcut[];
  }>;

type DateInputPropsOriginal = React.ComponentProps<typeof DateInput3>;

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

    const date = useMemo<string | undefined>(
      () =>
        mapOptional(ymd, (a) =>
          DateUtils.from(
            `${a.year}/${a.month}/${a.date} 12:34:56`,
          ).toISOString(),
        ),
      [ymd],
    );

    return (
      <DateInput3
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

const encodeDate = (date: RawDateType): string => date.toLocaleDateString();

const decodeDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

const inputProps: HTMLInputProps & InputGroupProps = {
  style: { width: '90px' },
} as const;

const tenYearsLater = pipe(DateUtils.today())
  .chain(
    DateUtils.updateLocaleYear((y) => toSafeUint(y + 99) satisfies YearEnum),
  )
  .chain(DateUtils.setLocaleMonth(12))
  .chain(DateUtils.toDate).value;
