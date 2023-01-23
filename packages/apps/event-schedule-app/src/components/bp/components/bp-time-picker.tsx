import { TimePicker } from '@blueprintjs/datetime';
import { type ComponentProps } from 'react';

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
          hours: DateUtils.getLocaleHours(date),
          minutes: DateUtils.getLocaleMinutes(date),
        });
      },
      [onTimeChange]
    );

    const dateObj = useMemo<RawDateType>(
      () =>
        pipe(DateUtils.from(`1970/1/1 ${time.hours}:${time.minutes}:11`)).chain(
          DateUtils.toDate
        ).value,
      [time]
    );

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TimePicker value={dateObj} onChange={onChangeHandler} {...props} />;
  }
);
