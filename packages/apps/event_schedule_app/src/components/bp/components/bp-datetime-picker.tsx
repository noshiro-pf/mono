import type { DatePickerShortcut } from '@blueprintjs/datetime';
import { DateInput } from '@blueprintjs/datetime';
import type { Ymdhm } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';
import type { ComponentProps } from 'react';
import { useCallback, useMemo } from 'react';

const pad2 = (n: number): string => n.toString().padStart(2, '0');
const formatDate = (date: ReadonlyDate): string =>
  `${getYear(date)}-${pad2(getMonth(date))}-${pad2(getDate(date))}  ${pad2(
    getHours(date)
  )}:${pad2(getMinutes(date))}`;
const parseDate = (str: string): Date => new Date(str);

const tenYearsLater = new Date(getYear(new Date()) + 99, 11);

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
      (dt: Date | null | undefined, isUserChange: boolean) => {
        if (dt == null) {
          onYmdhmChange(undefined);
          return;
        }
        if (!isUserChange) return;
        onYmdhmChange({
          year: getYear(dt),
          month: getMonth(dt),
          date: getDate(dt),
          hours: getHours(dt),
          minutes: getMinutes(dt),
        });
      },
      [onYmdhmChange]
    );

    const dateObj = useMemo<Date | undefined>(
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
