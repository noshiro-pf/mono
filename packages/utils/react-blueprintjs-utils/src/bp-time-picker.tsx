import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import type { ReadonlyDate } from '@noshiro/ts-utils';
import { getHours, getMinutes } from '@noshiro/ts-utils';
import { useCallback, useMemo } from 'react';
import type { HoursMinutes } from './types';

type Props = Readonly<{
  time: HoursMinutes;
  onTimeChange: (hm: HoursMinutes) => void;
}>;

export const BpTimePicker = memoNamed<Props>(
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
