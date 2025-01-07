import { DateInput, type DatePickerShortcut } from '@blueprintjs/datetime';
import { type Ymdhm } from '@noshiro/io-ts-types';
import { memoNamed } from '@noshiro/react-utils';
import {
  DateUtils,
  castMutable,
  mapOptional,
  pipe,
  toSafeUint,
} from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';

export type BpDatetimePickerProps = Omit<
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

// eslint-disable-next-line @typescript-eslint/no-deprecated
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
    const onChangeHandler = useCallback(
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

    const date = useMemo<string | undefined>(
      () =>
        mapOptional(ymdhm, (a) =>
          DateUtils.from(
            `${a.year}/${a.month}/${a.date} ${a.hours}:${a.minutes}:00`,
          ).toLocaleString(),
        ),
      [ymdhm],
    );

    return (
      // eslint-disable-next-line @typescript-eslint/no-deprecated
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

const formatDate = (date: RawDateType): string =>
  `${DateUtils.toLocaleYMD(date, '-')}  ${DateUtils.toLocaleHM(date, ':')}`;

const parseDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

const tenYearsLater = pipe(DateUtils.today())
  .chain(
    DateUtils.updateLocaleYear((a) => toSafeUint(a + 99) satisfies YearEnum),
  )
  .chain(DateUtils.setLocaleMonth(12))
  .chain(DateUtils.toDate).value;
