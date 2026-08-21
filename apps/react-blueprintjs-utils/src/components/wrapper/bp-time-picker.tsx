import { TimePicker } from '@blueprintjs/datetime';
import { DateUtils, type HoursMinutes } from 'io-ts-types';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { pipe } from 'ts-data-forge';

export type BpTimePickerProps = Readonly<{
  time: HoursMinutes;
  onTimeChange: (hm: HoursMinutes) => void;
}> &
  TimePickerPropsOriginal;

type TimePickerPropsOriginal = React.ComponentProps<typeof TimePicker>;

export const BpTimePicker = memoNamed<BpTimePickerProps>(
  'BpTimePicker',
  ({ time, onTimeChange, ...props }) => {
    const onChangeHandler = React.useCallback(
      (date: Date) => {
        onTimeChange({
          hours: DateUtils.getLocaleHours(date),
          minutes: DateUtils.getLocaleMinutes(date),
        });
      },
      [onTimeChange],
    );

    const dateObj = React.useMemo<Date>(
      () =>
        pipe(DateUtils.from(`1970/1/1 ${time.hours}:${time.minutes}:11`)).map(
          DateUtils.toDate,
        ).value,
      [time],
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TimePicker {...props} value={dateObj} onChange={onChangeHandler} />;
  },
);
