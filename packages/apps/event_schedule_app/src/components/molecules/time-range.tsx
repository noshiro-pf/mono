import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { DatetimeSpecificationEnumType } from '../../types/enum/datetime-specification-type';
import { IHoursMinutesType } from '../../types/record/hours-minutes';
import { ITimeRangeType } from '../../types/record/time-range';
import { BpTimePicker } from '../atoms/blueprint-js-wrapper/bp-time-picker';

const TimeRangeWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-left: 7px;
`;

export const TimeRange = memoNamed<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  timeRange: ITimeRangeType;
  onRangeStartChange: (hm: IHoursMinutesType) => void;
  onRangeEndChange: (hm: IHoursMinutesType) => void;
}>(
  'TimeRange',
  ({
    datetimeSpecification,
    timeRange,
    onRangeStartChange,
    onRangeEndChange,
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
        <div>{'～'}</div>
      ) : undefined}
      {datetimeSpecification === 'endSpecified' ||
      datetimeSpecification === 'startAndEndSpecified' ? (
        <BpTimePicker time={timeRange.end} onTimeChange={onRangeEndChange} />
      ) : undefined}
    </TimeRangeWrapper>
  )
);
