import type {
  DatetimeRange,
  DatetimeSpecificationEnumType,
  YearMonthDate,
} from '@noshiro/event-schedule-app-shared';
import { BpButton, BpSelect } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { IMapMapped } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { texts } from '../../../../constants';
import type { YmdKey } from '../../../../functions';
import { selectorOptions } from '../../../../functions';
import { useSelectDatetimesHooks } from '../../../../hooks';
import { AddElementButton, ButtonsWrapper } from '../../../molecules';
import { MultipleDatePicker } from '../../../multiple-date-picker';
import { DeleteAllButton } from '../../button-with-confirm';
import { SetTimesPopover } from '../set-times-popover';
import { SelectedDatetimeRow } from './selected-datetime-row';

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeList: readonly DatetimeRange[];
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

const vt = texts.eventSettingsPage.section2;

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
            <div>{vt.datetimeSpecification}</div>
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
            <BpButton
              icon='sort-asc'
              intent='primary'
              text={vt.sortDatetimes}
              onClick={onSortClick}
            />
          </ButtonsWrapper>
        </div>
        <MultipleDatePicker
          holidaysJpDefinition={holidaysJpDefinition}
          selectedDates={selectedDates}
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
