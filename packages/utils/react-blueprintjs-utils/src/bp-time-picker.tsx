import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { getHours, getMinutes } from '@noshiro/ts-utils';
import type { ComponentProps } from 'react';
import { useCallback, useMemo } from 'react';
import type { HoursMinutes } from './types';

type TimePickerPropsOriginal = ComponentProps<typeof TimePicker>;

export type BpTimePickerProps = Readonly<{
  time: HoursMinutes;
  onTimeChange: (hm: HoursMinutes) => void;
}> &
  TimePickerPropsOriginal;

export const BpTimePicker = memoNamed<BpTimePickerProps>(
  'BpTimePicker',
  ({ time, onTimeChange }) => {
    const onChangeHandler = useCallback(
      (date: ReadonlyDate) => {
        onTimeChange({
          hours: getHours(date),
          minutes: getMinutes(date),
        });
      },
      [onTimeChange]
    );

    const dateObj = useMemo<Date>(
      () => new Date(`1970/1/1 ${time.hours}:${time.minutes}:11`),
      [time]
    );

    return <TimePicker value={dateObj} onChange={onChangeHandler} />;
  }
);
