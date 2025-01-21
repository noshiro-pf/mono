import { Button } from '@blueprintjs/core';
import { BpSelect } from '@noshiro/react-blueprintjs-utils';
import { selectorOptions } from '../../../../functions';
import { useSelectDatetimesHooks } from '../../../../hooks';
import { AnswerPageStore, holidaysJpDefinition$ } from '../../../../store';
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
}>;

type CastedHandlerType = (value: string) => void;

export const SelectDatetimes = memoNamed<Props>(
  'SelectDatetimes',
  ({
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeList,
    onDatetimeListChange,
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

    const holidaysJpDefinition = useObservableValue(holidaysJpDefinition$);

    return (
      <div
        css={css`
          display: flex;
          flex-wrap: wrap-reverse;
        `}
      >
        <div>
          <div
            css={css`
              margin-bottom: 10px;
            `}
          >
            <div>{dc.datetimeSpecification}</div>
            <BpSelect
              options={selectorOptions}
              value={datetimeSpecification}
              onValueChange={
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                onDatetimeSpecificationChange as CastedHandlerType
              }
            />
          </div>
          <div
            css={css`
              margin-bottom: 10px;
            `}
            data-e2e={'datetime-list'}
          >
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
              ),
            )}
            <AddElementButton onClick={onAddDatetimeClick} />
          </div>
          <ButtonsWrapper>
            <DeleteAllButton onConfirmDeleteAll={onConfirmDeleteAll} />
            <SetTimesPopover
              datetimeSpecification={datetimeSpecification}
              initialValue={setTimesPopoverInitialValue}
              onSetTimesSubmit={onSetTimesPopoverSubmit}
            />
            <Button
              icon={'sort-asc'}
              intent={'primary'}
              text={dc.sortDatetimes}
              onClick={onSortClick}
            />
          </ButtonsWrapper>
        </div>
        <MultipleDatePicker
          holidaysJpDefinition={holidaysJpDefinition}
          selectedDates={selectedDates}
          setYearMonth$={AnswerPageStore.setYearMonth$}
          onSelectedDatesChange={onSelectedDatesChange}
        />
      </div>
    );
  },
);
