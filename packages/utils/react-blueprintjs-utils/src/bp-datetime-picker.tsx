import type { DatePickerShortcut } from '@blueprintjs/datetime';
import { DateInput } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { DateUtils, pipe } from '@noshiro/ts-utils';
import type { ComponentProps } from 'react';
import { useCallback, useMemo } from 'react';
import type { Ymdhm } from './types';

const formatDate = (date: RawDateType): string =>
  `${DateUtils.toLocaleYMD(date, '-')}  ${DateUtils.toLocaleHM(date, ':')}`;

const parseDate = (str: string): RawDateType =>
  pipe(DateUtils.from(str)).chain(DateUtils.toDate).value;

const tenYearsLater = pipe(DateUtils.today())
  .chain(DateUtils.updateLocaleYear((a) => a + 99))
  .chain(DateUtils.setLocaleMonth(12))
  .chain(DateUtils.toDate).value;

// eslint-disable-next-line deprecation/deprecation
type DateInputPropsOriginal = ComponentProps<typeof DateInput>;

export type BpDatetimePickerProps = Readonly<{
  ymdhm: Ymdhm | undefined;
  onYmdhmChange: (ymdhm: Ymdhm | undefined) => void;
  shortcuts?: boolean | readonly DatePickerShortcut[];
}> &
  StrictOmit<
    DateInputPropsOriginal,
    'formatDate' | 'parseDate' | 'shortcuts' | 'timePrecision'
  >;

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
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (dt: RawDateType | null | undefined, isUserChange: boolean) => {
        if (dt == null) {
          onYmdhmChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdhmChange({
          year: DateUtils.getLocaleYear(dt),
          month: DateUtils.getLocaleMonth(dt),
          date: DateUtils.getLocaleDate(dt),
          hours: DateUtils.getLocaleHours(dt),
          minutes: DateUtils.getLocaleMinutes(dt),
        });
      },
      [onYmdhmChange]
    );

    const dateObj = useMemo<RawDateType | undefined>(
      () =>
        ymdhm === undefined
          ? undefined
          : pipe(
              DateUtils.from(
                `${ymdhm.year}/${ymdhm.month}/${ymdhm.date} ${ymdhm.hours}:${ymdhm.minutes}:00`
              )
            ).chain(DateUtils.toDate).value,
      [ymdhm]
    );

    return (
      // eslint-disable-next-line deprecation/deprecation
      <DateInput
        canClearSelection={canClearSelection}
        formatDate={formatDate}
        maxDate={maxDate}
        parseDate={parseDate}
        placeholder={placeholder}
        reverseMonthAndYearMenus={reverseMonthAndYearMenus}
        shortcuts={shortcuts as Writable<typeof shortcuts>}
        showActionsBar={showActionsBar}
        timePrecision={'minute'}
        value={dateObj}
        onChange={onChangeHandler}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  }
);
