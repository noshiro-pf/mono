import { BpButton, BpSelect } from '@mono/react-blueprintjs-utils';
import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';
import { texts } from '../../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../../types/enum/datetime-specification-type';
import { IYearMonthDate } from '../../../../types/record/base/year-month-date';
import { IDatetimeRange } from '../../../../types/record/datetime-range';
import { IList, IMap } from '../../../../utils/immutable';
import { AddElementButton } from '../../../molecules/add-element-button';
import { ButtonsWrapper } from '../../../molecules/buttons-wrapper';
import { MultipleDatePicker } from '../../../multiple-date-picker/multiple-date-picker';
import { DeleteAllButton } from '../../button-with-confirm/delete-all-button';
import { SetTimesPopover } from '../set-times-popover/set-times-popover';
import { selctorOptions } from './options';
import { useSelectDatetimesHooks } from './select-datetimes-hooks';
import { SelectedDatetimeRow } from './selected-datetime-row';

interface Props {
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeList: IList<IDatetimeRange>;
  onDatetimeListChange: (list: IList<IDatetimeRange>) => void;
  holidaysJpDefinition: IMap<IYearMonthDate, string>;
}

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
              options={selctorOptions}
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
