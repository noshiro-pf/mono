import { Button } from '@blueprintjs/core';
import { BpDatePicker } from '../../../bp';
import { TimeRangeView } from '../../../molecules';

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRange: DatetimeRange;
  onYmdChange: (ymd: YearMonthDate | undefined) => void;
  onRangeStartChange: (hm: HoursMinutes) => void;
  onRangeEndChange: (hm: HoursMinutes) => void;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
}>;

export const SelectedDatetimeRow = memoNamed<Props>(
  'SelectedDatetimeRow',
  (props) => (
    <Root data-cy={'selected-datetime-row'}>
      <DatetimeWrapper>
        <YmdWrapper>
          <BpDatePicker
            closeOnSelection={true}
            ymd={props.datetimeRange.ymd}
            onYmdChange={props.onYmdChange}
          />
        </YmdWrapper>
        <TimeRangeView
          datetimeSpecification={props.datetimeSpecification}
          timeRange={props.datetimeRange.timeRange}
          onRangeEndChange={props.onRangeEndChange}
          onRangeStartChange={props.onRangeStartChange}
        />
      </DatetimeWrapper>

      <ButtonsWrapper>
        <Button
          icon={'duplicate'}
          minimal={true}
          onClick={props.onDuplicateClick}
        />
        <Button icon={'trash'} minimal={true} onClick={props.onDeleteClick} />
      </ButtonsWrapper>
    </Root>
  )
);

const Root = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  margin-bottom: 5px;
  justify-content: space-between;
`;

const DatetimeWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const YmdWrapper = styled.div`
  margin-top: 3px;
  margin-bottom: 3px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  margin-left: 5px;
`;
