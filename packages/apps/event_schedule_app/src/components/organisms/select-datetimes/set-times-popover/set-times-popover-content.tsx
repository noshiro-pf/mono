import { Button } from '@blueprintjs/core';
import type {
  DatetimeSpecificationEnumType,
  HoursMinutes,
  TimeRange,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback, useReducer } from 'react';
import styled from 'styled-components';
import { dict } from '../../../../constants';
import { timeRangeReducer } from '../../../../functions';
import { TimeRangeView } from '../../../molecules';
import { ButtonsWrapperAlignEnd } from '../../../styled';

type Props = Readonly<{
  initialValue: TimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onCancelClick: () => void;
  onOkClick: (timeRange: TimeRange) => void;
}>;

export const SetTimesPopoverContent = memoNamed<Props>(
  'SetTimesPopoverContent',
  ({ initialValue, datetimeSpecification, onCancelClick, onOkClick }) => {
    const [timeRange, dispatch] = useReducer(timeRangeReducer, initialValue);

    const onRangeStartChange = useCallback((hm: HoursMinutes) => {
      dispatch({ type: 'start', hm });
    }, []);
    const onRangeEndChange = useCallback((hm: HoursMinutes) => {
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
          onRangeEndChange={onRangeEndChange}
          onRangeStartChange={onRangeStartChange}
        />
        <ButtonsWrapperAlignEnd>
          <Button
            intent='none'
            text={dict.common.buttonText.cancel}
            onClick={onCancelClick}
          />
          <Button
            intent='primary'
            text={dict.common.buttonText.decide}
            onClick={onOkClickHandler}
          />
        </ButtonsWrapperAlignEnd>
      </Root>
    );
  }
);

const Root = styled.div`
  padding: 10px;
`;
