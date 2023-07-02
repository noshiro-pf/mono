import { Button } from '@blueprintjs/core';
import { timeRangeDefaultValue } from '@noshiro/event-schedule-app-shared';
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
    useEffect(() => {
      dispatch({ type: 'init', timeRange: initialValue });
    }, [initialValue]);

    const timeRange = useObservableValue(timeRange$);

    const onOkClickHandler = useCallback(() => {
      onOkClick(timeRange);
    }, [onOkClick, timeRange]);

    return (
      <div
        css={css`
          padding: 10px;
        `}
      >
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
      </div>
    );
  }
);

const [timeRange$, dispatch] = createReducer(
  timeRangeReducer,
  timeRangeDefaultValue
);

const onRangeStartChange = (hm: HoursMinutes): void => {
  dispatch({ type: 'start', hm });
};

const onRangeEndChange = (hm: HoursMinutes): void => {
  dispatch({ type: 'end', hm });
};
