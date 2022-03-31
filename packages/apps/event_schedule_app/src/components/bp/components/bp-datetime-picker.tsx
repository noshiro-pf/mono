import type { DatePickerShortcut } from '@blueprintjs/datetime';
import { DateInput } from '@blueprintjs/datetime';
import type { Ymdhm } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { IDate, pipe } from '@noshiro/ts-utils';
import type { ComponentProps } from 'react';
import { useCallback, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
const formatDate = (date: ReadonlyDate): string =>
  `${IDate.toLocaleYMD(date, '-')}  ${IDate.toLocaleHM(date, ':')}`;

// eslint-disable-next-line @typescript-eslint/ban-types
const parseDate = (str: string): Date => new Date(str);

const tenYearsLater = pipe(IDate.today())
  .chain(IDate.updateLocaleYear((a) => a + 99))
  .chain(IDate.setLocaleMonth(12))
  .chain(IDate.toDate).value;

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
      // eslint-disable-next-line @typescript-eslint/ban-types
      (dt: ReadonlyDate | null | undefined, isUserChange: boolean) => {
        if (dt == null) {
          onYmdhmChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdhmChange({
          year: IDate.getLocaleYear(dt),
          month: IDate.getLocaleMonth(dt),
          date: IDate.getLocaleDate(dt),
          hours: IDate.getLocaleHours(dt),
          minutes: IDate.getLocaleMinutes(dt),
        });
      },
      [onYmdhmChange]
    );

    // eslint-disable-next-line @typescript-eslint/ban-types
    const dateObj = useMemo<ReadonlyDate | undefined>(
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
