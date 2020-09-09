import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useMemo } from 'react';
import {
  IHoursMinutes,
  IHoursMinutesType,
} from '../../../types/record/hours-minutes';
import { getHours } from '../../../utils/datetime/functions/date-method-wrapper/hours';
import { getMinutes } from '../../../utils/datetime/functions/date-method-wrapper/minutes';

export const BpTimePicker = memoNamed<{
  time: IHoursMinutesType;
  onTimeChange: (hm: IHoursMinutesType) => void;
}>('BpTimePicker', ({ time, onTimeChange }) => {
  const onChangeHandler = useCallback(
    (date: Date) => {
      const h = getHours(date);
      const m = getMinutes(date);
      const hmFromDate = IHoursMinutes({ hours: h, minutes: m });
      onTimeChange(hmFromDate);
    },
    [onTimeChange]
  );

  const dateObj = useMemo<Date>(
    () => new Date(`1900/1/1 ${time.hours}:${time.minutes}:11`),
    [time]
  );

  return <TimePicker value={dateObj} onChange={onChangeHandler} />;
});
