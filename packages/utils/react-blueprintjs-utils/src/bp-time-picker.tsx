import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@mono/react-utils';
import { getHours, getMinutes } from '@mono/ts-utils';
import React, { useCallback, useMemo } from 'react';
import { HoursMinutes } from './types/hours-minutes';

interface Props {
  time: HoursMinutes;
  onTimeChange: (hm: HoursMinutes) => void;
}

export const BpTimePicker = memoNamed<Props>(
  'BpTimePicker',
  ({ time, onTimeChange }) => {
    const onChangeHandler = useCallback(
      (date: Date) => {
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
