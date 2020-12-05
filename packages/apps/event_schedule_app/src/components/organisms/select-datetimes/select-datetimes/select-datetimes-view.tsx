import { IOptionProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../../../constants/texts';
import {
  DatetimeSpecificationEnumType,
  datetimeSpecificationOptions,
} from '../../../../types/enum/datetime-specification-type';
import { IHoursMinutes } from '../../../../types/record/base/hours-minutes';
import { IYearMonthDate } from '../../../../types/record/base/year-month-date';
import { IDatetimeRange } from '../../../../types/record/datetime-range';
import { ITimeRange } from '../../../../types/record/time-range';
import { IList } from '../../../../utils/immutable';
import { BpSelect } from '../../../atoms/blueprint-js-wrapper/bp-select';
import { BpButton } from '../../../atoms/blueprint-js-wrapper/button';
import { AddElementButton } from '../../../molecules/add-element-button';
import { ButtonsWrapper } from '../../../molecules/buttons-wrapper';
import { MultipleDatePicker } from '../../../multiple-date-picker/multiple-date-picker';
import { DeleteAllButton } from '../delete-all/delete-all-button';
import { SetTimesPopover } from '../set-times-popover/set-times-popover';
import { SelectedDatetimeRow } from './selected-datetime-row';

const vt = texts.createEventPage.section2;

const options: IOptionProps[] = [
  {
    label: vt.datetimeSpecificationOptions.noStartEndSpecified,
    value: datetimeSpecificationOptions.noStartEndSpecified,
  },
  {
    label: vt.datetimeSpecificationOptions.startSpecified,
    value: datetimeSpecificationOptions.startSpecified,
  },
  {
    label: vt.datetimeSpecificationOptions.endSpecified,
    value: datetimeSpecificationOptions.endSpecified,
  },
  {
    label: vt.datetimeSpecificationOptions.startAndEndSpecified,
    value: datetimeSpecificationOptions.startAndEndSpecified,
  },
];

type CastedHandlerType = (value: string) => void;

interface Props {
  selectedDates: IList<IYearMonthDate>;
  onSelectedDatesChange: (v: IList<IYearMonthDate>) => void;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeListWithHandler: IList<{
    id: number;
    datetimeRange: IDatetimeRange;
    onYmdChange: (ymd: IYearMonthDate | undefined) => void;
    onRangeStartChange: (hm: IHoursMinutes) => void;
    onRangeEndChange: (hm: IHoursMinutes) => void;
    onDuplicateClick: () => void;
    onDeleteClick: () => void;
  }>;
  onAddDatetimeClick: () => void;
  onConfirmDeleteAll: () => void;
  setTimesPopoverInitialValue: ITimeRange;
  onSetTimesPopoverSubmit: (timeRange: ITimeRange) => void;
  onSortClick: () => void;
}

export const SelectDatetimeView = memoNamed<Props>(
  'SelectDatetimeView',
  (props) => (
    <Root>
      <div>
        <DatetimeSpecificationSelectWrapper>
          <div>{vt.datetimeSpecification}</div>
          <BpSelect
            value={props.datetimeSpecification}
            onValueChange={
              props.onDatetimeSpecificationChange as CastedHandlerType
            }
            options={options}
          />
        </DatetimeSpecificationSelectWrapper>
        <DatetimeRangeListWrapper>
          {props.datetimeListWithHandler.map(
            ({
              id,
              datetimeRange,
              onYmdChange,
              onRangeStartChange,
              onRangeEndChange,
              onDuplicateClick,
              onDeleteClick,
            }) => (
              <SelectedDatetimeRow
                key={id}
                datetimeSpecification={props.datetimeSpecification}
                datetimeRange={datetimeRange}
                onYmdChange={onYmdChange}
                onRangeStartChange={onRangeStartChange}
                onRangeEndChange={onRangeEndChange}
                onDuplicateClick={onDuplicateClick}
                onDeleteClick={onDeleteClick}
              />
            )
          )}
          <AddElementButton onClick={props.onAddDatetimeClick} />
        </DatetimeRangeListWrapper>
        <ButtonsWrapper>
          <DeleteAllButton onConfirmDeleteAll={props.onConfirmDeleteAll} />
          <SetTimesPopover
            initialValue={props.setTimesPopoverInitialValue}
            datetimeSpecification={props.datetimeSpecification}
            onSetTimesSubmit={props.onSetTimesPopoverSubmit}
          />
          <BpButton
            intent='primary'
            icon='sort-asc'
            text={vt.sortDatetimes}
            onClick={props.onSortClick}
          />
        </ButtonsWrapper>
      </div>
      <MultipleDatePicker
        selectedDates={props.selectedDates}
        onSelectedDatesChange={props.onSelectedDatesChange}
      />
    </Root>
  )
);

const Root = styled.div`
  display: flex;
  flex-wrap: wrap-reverse;
`;

const DatetimeSpecificationSelectWrapper = styled.div`
  margin-bottom: 10px;
`;

const DatetimeRangeListWrapper = styled.div`
  margin-bottom: 10px;
`;
