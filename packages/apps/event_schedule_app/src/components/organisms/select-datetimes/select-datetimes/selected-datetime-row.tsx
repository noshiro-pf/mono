import {
  BpButton,
  BpDatePicker,
  YearMonthDate,
} from '@mono/react-blueprintjs-utils';
import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { IHoursMinutes } from '../../../../types/record/base/hours-minutes';
import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../../../../types/record/base/year-month-date';
import { IDatetimeRange } from '../../../../types/record/datetime-range';
import { TimeRangeView } from '../../../molecules/time-range';

interface Props {
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRange: IDatetimeRange;
  onYmdChange: (ymd: IYearMonthDate | undefined) => void;
  onRangeStartChange: (hm: IHoursMinutes) => void;
  onRangeEndChange: (hm: IHoursMinutes) => void;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
}

const onYmdChangeFn = (
  onIYmdChange: (iymd: IYearMonthDate | undefined) => void
) => (ymd: YearMonthDate | undefined) => {
  onIYmdChange(createIYearMonthDate(ymd));
};

export const SelectedDatetimeRow = memoNamed<Props>(
  'SelectedDatetimeRow',
  (props) => (
    <Root>
      <DatetimeWrapper>
        <YmdWrapper>
          <BpDatePicker
            ymd={props.datetimeRange.ymd}
            onYmdChange={onYmdChangeFn(props.onYmdChange)}
            closeOnSelection={true}
          />
        </YmdWrapper>
        <TimeRangeView
          datetimeSpecification={props.datetimeSpecification}
          timeRange={props.datetimeRange.timeRange}
          onRangeStartChange={props.onRangeStartChange}
          onRangeEndChange={props.onRangeEndChange}
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
