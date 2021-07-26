import type {
  DatetimeRange,
  DatetimeSpecificationEnumType,
  HoursMinutes,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { BpButton, BpDatePicker } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
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
    <Root>
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
        <BpButton
          icon={'duplicate'}
          minimal={true}
          onClick={props.onDuplicateClick}
        />
        <BpButton icon={'trash'} minimal={true} onClick={props.onDeleteClick} />
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
