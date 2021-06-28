import type {
  DatetimeSpecificationEnumType,
  HoursMinutes,
  TimeRange,
} from '@noshiro/event-schedule-app-shared';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback, useReducer } from 'react';
import styled from 'styled-components';
import { texts } from '../../../../constants';
import { ButtonsWrapperAlignEnd, TimeRangeView } from '../../../molecules';
import { timeRangeReducer } from './time-range-reducer';

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
            text={texts.buttonText.decide}
          />
        </ButtonsWrapperAlignEnd>
      </Root>
    );
  }
);

const Root = styled.div`
  padding: 10px;
`;
