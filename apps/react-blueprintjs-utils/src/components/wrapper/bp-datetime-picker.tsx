import { DateInput, type DatePickerShortcut } from '@blueprintjs/datetime';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { asSafeUint, castMutable, pipe } from 'ts-data-forge';
import { DateUtils, type Ymdhm } from 'ts-fortress-types';
import { type SafeUint, type StrictOmit } from 'ts-type-forge';
import { mapOptional } from '../../utils/index.mjs';

export type BpDatetimePickerProps = StrictOmit<
  DateInputPropsOriginal,
  | 'className'
  | 'defaultValue'
  | 'formatDate'
  | 'onChange'
  | 'parseDate'
  | 'shortcuts'
  | 'timePrecision'
  | 'value'
> &
  Readonly<{
    ymdhm: Ymdhm | undefined;
    onYmdhmChange: (ymdhm: Ymdhm | undefined) => void;
    shortcuts?: boolean | readonly DatePickerShortcut[];
  }>;

type DateInputPropsOriginal = React.ComponentProps<typeof DateInput>;

export const BpDatetimePicker = memoNamed<BpDatetimePickerProps>(
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
    const onChangeHandler = React.useCallback(
      (dateStr: string | null, isUserChange?: boolean) => {
        if (dateStr == null) {
          onYmdhmChange(undefined);

          return;
        }

        if (isUserChange !== true) return;

        const dt = parseDate(dateStr);

        onYmdhmChange({
          year: DateUtils.getLocaleYear(dt),
          month: DateUtils.getLocaleMonth(dt),
          date: DateUtils.getLocaleDate(dt),
          hours: DateUtils.getLocaleHours(dt),
          minutes: DateUtils.getLocaleMinutes(dt),
        });
      },
      [onYmdhmChange],
    );

    const date = React.useMemo<string | undefined>(
      () =>
        mapOptional(ymdhm, (a) =>
          DateUtils.from(
            `${a.year}/${a.month}/${a.date} ${a.hours}:${a.minutes}:00`,
          ).toLocaleString(),
        ),
      [ymdhm],
    );

    return (
      <DateInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        canClearSelection={canClearSelection}
        formatDate={formatDate}
        maxDate={maxDate}
        parseDate={parseDate}
        placeholder={placeholder}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        shortcuts={castMutable(shortcuts)}
        showActionsBar={showActionsBar}
        /**
         * FIXME: Blueprintjs v5 から showTimezoneSelect = true としていると
         * 以下のエラーが発生するようになったため一旦非表示にしている。
         *
         *     'Internal React error: Expected static flag was missing.';
         */
        showTimezoneSelect={false}
        timePrecision={'minute'}
        value={date}
        onChange={onChangeHandler}
      />
    );
  },
);

const formatDate = (date: Date): string =>
  `${DateUtils.toLocaleYMD(date, '-')}  ${DateUtils.toLocaleHM(date, ':')}` as const;

const parseDate = (str: string): Date =>
  pipe(DateUtils.from(str)).map(DateUtils.toDate).value;

const tenYearsLater = pipe(DateUtils.today())
  .map(DateUtils.updateLocaleYear((a) => asSafeUint(a + 99) satisfies SafeUint))
  .map(DateUtils.setLocaleMonth(12))
  .map(DateUtils.toDate).value;
