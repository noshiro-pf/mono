import type {
  DatetimeSpecificationEnumType,
  HoursMinutes,
  TimeRange,
} from '@noshiro/event-schedule-app-api';
import { BpTimePicker } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  timeRange: TimeRange;
  onRangeStartChange: (hm: HoursMinutes) => void;
  onRangeEndChange: (hm: HoursMinutes) => void;
}>;

export const TimeRangeView = memoNamed<Props>('TimeRangeView', (props) => (
  <TimeRangeWrapper>
    {props.datetimeSpecification === 'startSpecified' ||
    props.datetimeSpecification === 'startAndEndSpecified' ? (
      <BpTimePicker
        time={props.timeRange.start}
        onTimeChange={props.onRangeStartChange}
      />
    ) : undefined}
    {props.datetimeSpecification !== 'noStartEndSpecified' ? (
      <div>{'～'}</div>
    ) : undefined}
    {props.datetimeSpecification === 'endSpecified' ||
    props.datetimeSpecification === 'startAndEndSpecified' ? (
      <BpTimePicker
        time={props.timeRange.end}
        onTimeChange={props.onRangeEndChange}
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
