import { TimePicker } from '@blueprintjs/datetime';
import { memoNamed } from '@noshiro/react-utils';
import { IDate, pipe } from '@noshiro/ts-utils';
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
      (date: RawDateType) => {
        onTimeChange({
          hours: IDate.getLocaleHours(date),
          minutes: IDate.getLocaleMinutes(date),
        });
      },
      [onTimeChange]
    );

    const dateObj = useMemo<RawDateType>(
      () =>
        pipe(IDate.from(`1970/1/1 ${time.hours}:${time.minutes}:11`)).chain(
          IDate.toDate
        ).value,
      [time]
    );

    return <TimePicker value={dateObj} onChange={onChangeHandler} />;
  }
);
