import { Button, IOptionProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../../../constants/texts';
import {
  DatetimeSpecificationEnumType,
  datetimeSpecificationOptions,
} from '../../../../types/enum/datetime-specification-type';
import { IDatetimeRangeType } from '../../../../types/record/datetime-range';
import { IHoursMinutesType } from '../../../../types/record/hours-minutes';
import { ITimeRangeType } from '../../../../types/record/time-range';
import { IYearMonthDateType } from '../../../../types/record/year-month-date';
import { ForciblyUpdatedValue } from '../../../../utils/forcibly-updated-value';
import { IList } from '../../../../utils/immutable';
import { BpSelect } from '../../../atoms/blueprint-js-wrapper/bp-select';
import { AddElementButton } from '../../../molecules/add-element-button';
import { ButtonsWrapper } from '../../../molecules/buttons-wrapper';
import { SelectedDatetimeRow } from '../../../molecules/selected-datetime-row';
import { MultipleDatePicker } from '../../../multiple-date-picker/multiple-date-picker';
import { DeleteAllButton } from '../delete-all/delete-all-button';
import { SetTimesPopover } from '../set-times-popover/set-times-popover';

const vt = texts.createEventPage.section2;

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

const handlerTypeConverter = <T, S>(
  handler: (value: T) => void
): ((value: S) => void) => (value: S) => handler((value as unknown) as T);

export const SelectDatetimeView = memoNamed<{
  selectedDates: ForciblyUpdatedValue<IList<IYearMonthDateType>>;
  onSelectedDatesChange: (v: IList<IYearMonthDateType>) => void;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeListWithHandler: IList<{
    id: number;
    datetimeRange: IDatetimeRangeType;
    onYmdChange: (ymd: IYearMonthDateType | undefined) => void;
    onRangeStartChange: (hm: IHoursMinutesType) => void;
    onRangeEndChange: (hm: IHoursMinutesType) => void;
    onDuplicateClick: () => void;
    onDeleteClick: () => void;
  }>;
  onAddDatetimeClick: () => void;
  onConfirmDeleteAll: () => void;
  setTimesPopoverInitialValue: ITimeRangeType;
  onSetTimesPopoverSubmit: (timeRange: ITimeRangeType) => void;
  onSortClick: () => void;
}>(
  'SelectDatetimeView',
  ({
    selectedDates,
    onSelectedDatesChange,
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeListWithHandler,
    onAddDatetimeClick,
    setTimesPopoverInitialValue,
    onSetTimesPopoverSubmit,
    onConfirmDeleteAll,
    onSortClick,
  }) => (
    <Root>
      <div>
        <DatetimeSpecificationSelectWrapper>
          <div>{vt.datetimeSpecification}</div>
          <BpSelect
            value={datetimeSpecification}
            onValueChange={handlerTypeConverter<
              DatetimeSpecificationEnumType,
              string
            >(onDatetimeSpecificationChange)}
            options={options}
          />
        </DatetimeSpecificationSelectWrapper>
        <DatetimeRangeListWrapper>
          {datetimeListWithHandler.map(
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
                datetimeSpecification={datetimeSpecification}
                datetimeRange={datetimeRange}
                onYmdChange={onYmdChange}
                onRangeStartChange={onRangeStartChange}
                onRangeEndChange={onRangeEndChange}
                onDuplicateClick={onDuplicateClick}
                onDeleteClick={onDeleteClick}
              />
            )
          )}
          <AddElementButton onClick={onAddDatetimeClick} />
        </DatetimeRangeListWrapper>
        <ButtonsWrapper>
          <DeleteAllButton onConfirmDeleteAll={onConfirmDeleteAll} />
          <SetTimesPopover
            initialValue={setTimesPopoverInitialValue}
            datetimeSpecification={datetimeSpecification}
            onSetTimesSubmit={onSetTimesPopoverSubmit}
          />
          <Button
            intent='primary'
            icon='sort-asc'
            text={vt.sortDatetimes}
            onClick={onSortClick}
          />
        </ButtonsWrapper>
      </div>
      <MultipleDatePicker
        selectedDates={selectedDates}
        onSelectedDatesChange={onSelectedDatesChange}
      />
    </Root>
  )
);
