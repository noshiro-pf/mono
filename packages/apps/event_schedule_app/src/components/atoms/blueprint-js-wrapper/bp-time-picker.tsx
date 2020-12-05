import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@mono/react-utils';
import { getHours, getMinutes } from '@mono/ts-utils';
import React, { useCallback, useMemo } from 'react';
import {
  createIHoursMinutes,
  IHoursMinutes,
} from '../../../types/record/base/hours-minutes';

interface Props {
  time: IHoursMinutes;
  onTimeChange: (hm: IHoursMinutes) => void;
}

export const BpTimePicker = memoNamed<Props>(
  'BpTimePicker',
  ({ time, onTimeChange }) => {
    const onChangeHandler = useCallback(
      (date: Date) => {
        const h = getHours(date);
        const m = getMinutes(date);
        const hmFromDate = createIHoursMinutes({ hours: h, minutes: m });
        onTimeChange(hmFromDate);
      },
      [onTimeChange]
    );

    const dateObj = useMemo<Date>(
      () => new Date(`1900/1/1 ${time.hours}:${time.minutes}:11`),
      [time]
    );

    return <TimePicker value={dateObj} onChange={onChangeHandler} />;
  }
);
