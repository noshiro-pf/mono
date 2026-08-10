import { TimePicker } from '@blueprintjs/datetime';
import { type HoursMinutes } from '@noshiro/io-ts-types';
import { memoNamed } from '@noshiro/react-utils';
import { DateUtils, pipe } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';

export type BpTimePickerProps = Readonly<{
  time: HoursMinutes;
  onTimeChange: (hm: HoursMinutes) => void;
}> &
  TimePickerPropsOriginal;

type TimePickerPropsOriginal = React.ComponentProps<typeof TimePicker>;

export const BpTimePicker = memoNamed<BpTimePickerProps>(
  'BpTimePicker',
  ({ time, onTimeChange, ...props }) => {
    const onChangeHandler = useCallback(
      (date: RawDateType) => {
        onTimeChange({
          hours: DateUtils.getLocaleHours(date),
          minutes: DateUtils.getLocaleMinutes(date),
        });
      },
      [onTimeChange],
    );

    const dateObj = useMemo<RawDateType>(
      () =>
        pipe(DateUtils.from(`1970/1/1 ${time.hours}:${time.minutes}:11`)).chain(
          DateUtils.toDate,
        ).value,
      [time],
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TimePicker {...props} value={dateObj} onChange={onChangeHandler} />;
  },
);
