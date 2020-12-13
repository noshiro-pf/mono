import { memoNamed } from '@mono/react-utils';
import React, { useCallback, useReducer } from 'react';
import styled from 'styled-components';
import { texts } from '../../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { IHoursMinutes } from '../../../../types/record/base/hours-minutes';
import { ITimeRange } from '../../../../types/record/time-range';
import { BpButton } from '../../../atoms/blueprint-js-wrapper/bp-button';
import { ButtonsWrapperAlignEnd } from '../../../molecules/buttons-wrapper';
import { TimeRangeView } from '../../../molecules/time-range';
import { timeRangeReducer } from './time-range-reducer';

interface Props {
  initialValue: ITimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onCancelClick: () => void;
  onOkClick: (timeRange: ITimeRange) => void;
}

export const SetTimesPopoverContent = memoNamed<Props>(
  'SetTimesPopoverContent',
  ({ initialValue, datetimeSpecification, onCancelClick, onOkClick }) => {
    const [timeRange, dispatch] = useReducer(timeRangeReducer, initialValue);

    const onRangeStartChange = useCallback((hm: IHoursMinutes) => {
      dispatch({ type: 'start', hm });
    }, []);
    const onRangeEndChange = useCallback((hm: IHoursMinutes) => {
      dispatch({ type: 'end', hm });
    }, []);

    const onOkClickHandler = useCallback(() => {
      onOkClick(timeRange);
    }, [onOkClick, timeRange]);

    return (
      <Root>
        <TimeRangeView
          datetimeSpecification={datetimeSpecification}
          timeRange={timeRange}
          onRangeStartChange={onRangeStartChange}
          onRangeEndChange={onRangeEndChange}
        />
        <ButtonsWrapperAlignEnd>
          <BpButton
            type='button'
            intent='none'
            onClick={onCancelClick}
            text={texts.buttonText.cancel}
          />
          <BpButton
            type='button'
            intent='primary'
            onClick={onOkClickHandler}
            text={texts.buttonText.deside}
          />
        </ButtonsWrapperAlignEnd>
      </Root>
    );
  }
);

const Root = styled.div`
  padding: 10px;
`;
