import { TimePicker } from 'blueprint-synstate';
import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { HoursMinutes } from 'ts-fortress-types';
import { dict } from '../../constants/index.mjs';
import { pad2 } from '../../utils/index.mjs';
import * as styles from './time-range.module.css';

type Props = Readonly<{
  datetimeSpecification: Bindable<DatetimeSpecificationEnumType>;
  timeRange: Bindable<TimeRange>;
  onRangeStartChange: (hm: HoursMinutes) => void;
  onRangeEndChange: (hm: HoursMinutes) => void;
}>;

/** The start and end times a date row asks for, as its specification says. */
export const TimeRangeView = ({
  datetimeSpecification,
  onRangeEndChange,
  onRangeStartChange,
  timeRange,
}: Props): JSX.Element => (
  <div class={constant(styles.timeRange)}>
    <If
      cond={mapBindable(
        datetimeSpecification,
        (s) => s === 'startSpecified' || s === 'startAndEndSpecified',
      )}
      then={
        <TimePicker
          value={mapBindable(timeRange, (r) => toTimeValue(r.start))}
          onChange={(value) => {
            onRangeStartChange(fromTimeValue(value));
          }}
        />
      }
    />
    <If
      cond={mapBindable(
        datetimeSpecification,
        (s) => s !== 'noStartEndSpecified',
      )}
      then={<div>{constant(dict.common.tilde)}</div>}
    />
    <If
      cond={mapBindable(
        datetimeSpecification,
        (s) => s === 'endSpecified' || s === 'startAndEndSpecified',
      )}
      then={
        <TimePicker
          value={mapBindable(timeRange, (r) => toTimeValue(r.end))}
          onChange={(value) => {
            onRangeEndChange(fromTimeValue(value));
          }}
        />
      }
    />
  </div>
);

const toTimeValue = ({ hours, minutes }: HoursMinutes): string =>
  `${pad2(hours)}:${pad2(minutes)}` as const;

/** `HH:mm`, which the time picker always gives, as hours and minutes. */
const fromTimeValue = (value: string): HoursMinutes => {
  const [hours, minutes] = value.split(':').map(Number);

  return HoursMinutes.fill({ hours, minutes });
};
