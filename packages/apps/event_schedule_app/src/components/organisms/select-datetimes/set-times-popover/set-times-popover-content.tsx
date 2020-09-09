import { Button } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { texts } from '../../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { IHoursMinutesType } from '../../../../types/record/hours-minutes';
import {
  ITimeRange,
  ITimeRangeType,
} from '../../../../types/record/time-range';
import { ButtonsWrapper } from '../../../molecules/buttons-wrapper';
import { TimeRange } from '../../../molecules/time-range';

const Root = styled.div`
  padding: 10px;
`;

export const SetTimesPopoverContent = memoNamed<{
  initialValue: ITimeRangeType;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onCancelClick: () => void;
  onOkClick: (timeRange: ITimeRangeType) => void;
}>(
  'SetTimesPopoverContent',
  ({ initialValue, datetimeSpecification, onCancelClick, onOkClick }) => {
    const [
      // dummy comment to control prettier
      rangeStart,
      onRangeStartChange,
    ] = useState<IHoursMinutesType>(initialValue.start);

    const [
      // dummy comment to control prettier
      rangeEnd,
      onRangeEndChange,
    ] = useState<IHoursMinutesType>(initialValue.end);

    const timeRange = useMemo<ITimeRangeType>(
      () => ITimeRange({ start: rangeStart, end: rangeEnd }),
      [rangeStart, rangeEnd]
    );

    const onOkClickHandler = useCallback(() => {
      onOkClick(timeRange);
    }, [onOkClick, timeRange]);

    return (
      <Root>
        <TimeRange
          datetimeSpecification={datetimeSpecification}
          timeRange={timeRange}
          onRangeStartChange={onRangeStartChange}
          onRangeEndChange={onRangeEndChange}
        />
        <ButtonsWrapper>
          <Button
            type='button'
            intent='none'
            onClick={onCancelClick}
            text={texts.buttonText.cancel}
          />
          <Button
            type='button'
            intent='primary'
            onClick={onOkClickHandler}
            text={texts.buttonText.deside}
          />
        </ButtonsWrapper>
      </Root>
    );
  }
);
