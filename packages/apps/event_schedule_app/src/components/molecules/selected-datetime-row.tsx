import { Button } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { DatetimeSpecificationEnumType } from '../../types/enum/datetime-specification-type';
import { IDatetimeRangeType } from '../../types/record/datetime-range';
import { IHoursMinutesType } from '../../types/record/hours-minutes';
import { IYearMonthDateType } from '../../types/record/year-month-date';
import { BpDatePicker } from '../atoms/blueprint-js-wrapper/bp-date-picker';
import { TimeRange } from './time-range';

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

export const SelectedDatetimeRow = memoNamed<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRange: IDatetimeRangeType;
  onYmdChange: (ymd: IYearMonthDateType | undefined) => void;
  onRangeStartChange: (hm: IHoursMinutesType) => void;
  onRangeEndChange: (hm: IHoursMinutesType) => void;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
}>(
  'SelectedDatetimeRow',
  ({
    datetimeSpecification,
    datetimeRange,
    onYmdChange,
    onRangeStartChange,
    onRangeEndChange,
    onDuplicateClick,
    onDeleteClick,
  }) => (
    <Root>
      <DatetimeWrapper>
        <YmdWrapper>
          <BpDatePicker
            ymd={datetimeRange.ymd}
            onYmdChange={onYmdChange}
            closeOnSelection={true}
          />
        </YmdWrapper>
        <TimeRange
          datetimeSpecification={datetimeSpecification}
          timeRange={datetimeRange.timeRange}
          onRangeStartChange={onRangeStartChange}
          onRangeEndChange={onRangeEndChange}
        />
      </DatetimeWrapper>

      <ButtonsWrapper>
        <Button icon={'duplicate'} minimal={true} onClick={onDuplicateClick} />
        <Button icon={'trash'} minimal={true} onClick={onDeleteClick} />
      </ButtonsWrapper>
    </Root>
  )
);
