import { BpTimePicker } from '../bp';

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  timeRange: TimeRange;
  onRangeStartChange: (hm: HoursMinutes) => void;
  onRangeEndChange: (hm: HoursMinutes) => void;
}>;

export const TimeRangeView = memoNamed<Props>(
  'TimeRangeView',
  ({
    datetimeSpecification,
    onRangeEndChange,
    onRangeStartChange,
    timeRange,
  }) => (
    <TimeRangeWrapper>
      {datetimeSpecification === 'startSpecified' ||
      datetimeSpecification === 'startAndEndSpecified' ? (
        <BpTimePicker
          time={timeRange.start}
          onTimeChange={onRangeStartChange}
        />
      ) : undefined}
      {datetimeSpecification !== 'noStartEndSpecified' ? (
        <div>{dict.common.tilde}</div>
      ) : undefined}
      {datetimeSpecification === 'endSpecified' ||
      datetimeSpecification === 'startAndEndSpecified' ? (
        <BpTimePicker time={timeRange.end} onTimeChange={onRangeEndChange} />
      ) : undefined}
    </TimeRangeWrapper>
  )
);

const TimeRangeWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-left: 7px;
`;
