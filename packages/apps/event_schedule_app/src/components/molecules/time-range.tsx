import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { DatetimeSpecificationEnumType } from '../../types/enum/datetime-specification-type';
import { IHoursMinutes } from '../../types/record/base/hours-minutes';
import { ITimeRange } from '../../types/record/time-range';
import { BpTimePicker } from '../atoms/blueprint-js-wrapper/bp-time-picker';

type Props = {
  datetimeSpecification: DatetimeSpecificationEnumType;
  timeRange: ITimeRange;
  onRangeStartChange: (hm: IHoursMinutes) => void;
  onRangeEndChange: (hm: IHoursMinutes) => void;
};

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
