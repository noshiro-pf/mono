import { TimePicker } from '@blueprintjs/datetime';
import type { HoursMinutes } from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { IDate, pipe } from '@noshiro/ts-utils';
import type { ComponentProps } from 'react';
import { useCallback, useMemo } from 'react';

type TimePickerPropsOriginal = ComponentProps<typeof TimePicker>;

export type BpTimePickerProps = Readonly<{
  time: HoursMinutes;
  onTimeChange: (hm: HoursMinutes) => void;
}> &
  TimePickerPropsOriginal;

export const BpTimePicker = memoNamed<BpTimePickerProps>(
  'BpTimePicker',
  ({ time, onTimeChange, ...props }) => {
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

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TimePicker value={dateObj} onChange={onChangeHandler} {...props} />;
  }
);
