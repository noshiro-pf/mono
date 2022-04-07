import { Button } from '@blueprintjs/core';
import type {
  DatetimeRange,
  DatetimeSpecificationEnumType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../../../constants';
import type { YmdKey } from '../../../../functions';
import { selectorOptions } from '../../../../functions';
import { useSelectDatetimesHooks } from '../../../../hooks';
import { setYearMonth$ } from '../../../../store';
import { BpSelect } from '../../../bp';
import { AddElementButton } from '../../../molecules';
import { MultipleDatePicker } from '../../../multiple-date-picker';
import { ButtonsWrapper } from '../../../styled';
import { DeleteAllButton } from '../../button-with-confirm';
import { SetTimesPopover } from '../set-times-popover';
import { SelectedDatetimeRow } from './selected-datetime-row';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeList: readonly DatetimeRange[];
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

type CastedHandlerType = (value: string) => void;

export const SelectDatetimes = memoNamed<Props>(
  'SelectDatetimes',
  ({
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeList,
    onDatetimeListChange,
    holidaysJpDefinition,
  }) => {
    const {
      selectedDates,
      onSelectedDatesChange,
      datetimeListWithHandler,
      onAddDatetimeClick,
      onConfirmDeleteAll,
      setTimesPopoverInitialValue,
      onSetTimesPopoverSubmit,
      onSortClick,
    } = useSelectDatetimesHooks(datetimeList, onDatetimeListChange);

    return (
      <Root>
        <div>
          <DatetimeSpecificationSelectWrapper>
            <div>{dc.datetimeSpecification}</div>
            <BpSelect
              options={selectorOptions}
              value={datetimeSpecification}
              onValueChange={onDatetimeSpecificationChange as CastedHandlerType}
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
                  datetimeRange={datetimeRange}
                  datetimeSpecification={datetimeSpecification}
                  onDeleteClick={onDeleteClick}
                  onDuplicateClick={onDuplicateClick}
                  onRangeEndChange={onRangeEndChange}
                  onRangeStartChange={onRangeStartChange}
                  onYmdChange={onYmdChange}
                />
              )
            )}
            <AddElementButton onClick={onAddDatetimeClick} />
          </DatetimeRangeListWrapper>
          <ButtonsWrapper>
            <DeleteAllButton onConfirmDeleteAll={onConfirmDeleteAll} />
            <SetTimesPopover
              datetimeSpecification={datetimeSpecification}
              initialValue={setTimesPopoverInitialValue}
              onSetTimesSubmit={onSetTimesPopoverSubmit}
            />
            <Button
              icon='sort-asc'
              intent='primary'
              text={dc.sortDatetimes}
              onClick={onSortClick}
            />
          </ButtonsWrapper>
        </div>
        <MultipleDatePicker
          holidaysJpDefinition={holidaysJpDefinition}
          selectedDates={selectedDates}
          setYearMonth$={setYearMonth$}
          onSelectedDatesChange={onSelectedDatesChange}
        />
      </Root>
    );
  }
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
