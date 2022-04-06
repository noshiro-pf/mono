import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { IDate } from '@noshiro/ts-utils';
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
      // eslint-disable-next-line @typescript-eslint/ban-types
      (date: ReadonlyDate) => {
        onTimeChange({
          hours: IDate.getLocaleHours(date),
          minutes: IDate.getLocaleMinutes(date),
        });
      },
      [onTimeChange]
    );

    // eslint-disable-next-line @typescript-eslint/ban-types, no-restricted-globals
    const dateObj = useMemo<Date>(
      // eslint-disable-next-line no-restricted-globals
      () => new Date(`1970/1/1 ${time.hours}:${time.minutes}:11`),
      [time]
    );

    return <TimePicker value={dateObj} onChange={onChangeHandler} />;
  }
);
