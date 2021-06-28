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
import { AddElementButton, ButtonsWrapper } from '../../../molecules';
import { MultipleDatePicker } from '../../../multiple-date-picker';
import { DeleteAllButton } from '../../button-with-confirm';
import { SetTimesPopover } from '../set-times-popover';
import { selectorOptions } from './options';
import { useSelectDatetimesHooks } from './select-datetimes-hooks';
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
              value={datetimeSpecification}
              onValueChange={onDatetimeSpecificationChange as CastedHandlerType}
              options={selectorOptions}
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
            <BpButton
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
          holidaysJpDefinition={holidaysJpDefinition}
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
