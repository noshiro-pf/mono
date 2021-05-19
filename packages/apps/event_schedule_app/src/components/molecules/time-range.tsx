import type { HoursMinutes } from '@noshiro/react-blueprintjs-utils';
import { BpTimePicker } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import type {
  DatetimeSpecificationEnumType,
  IHoursMinutes,
  ITimeRange,
} from '../../types';
import { createIHoursMinutes } from '../../types';

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  timeRange: ITimeRange;
  onRangeStartChange: (hm: IHoursMinutes) => void;
  onRangeEndChange: (hm: IHoursMinutes) => void;
}>;

const onTimeChangeFn =
  (onITimeChange: (hm: IHoursMinutes) => void) =>
  (hm: HoursMinutes): void => {
    onITimeChange(createIHoursMinutes(hm));
  };

export const TimeRangeView = memoNamed<Props>('TimeRangeView', (props) => (
  <TimeRangeWrapper>
    {props.datetimeSpecification === 'startSpecified' ||
    props.datetimeSpecification === 'startAndEndSpecified' ? (
      <BpTimePicker
        time={props.timeRange.start}
        onTimeChange={onTimeChangeFn(props.onRangeStartChange)}
      />
    ) : undefined}
    {props.datetimeSpecification !== 'noStartEndSpecified' ? (
      <div>{'～'}</div>
    ) : undefined}
    {props.datetimeSpecification === 'endSpecified' ||
    props.datetimeSpecification === 'startAndEndSpecified' ? (
      <BpTimePicker
        time={props.timeRange.end}
        onTimeChange={onTimeChangeFn(props.onRangeEndChange)}
      />
    ) : undefined}
  </TimeRangeWrapper>
));

const TimeRangeWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-left: 7px;
`;
