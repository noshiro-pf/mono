import { Button, HtmlSelect } from 'blueprint-synstate';
import {
  constant,
  For,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { asUint32, Optional } from 'ts-data-forge';
import { dict } from '../../../../constants/index.mjs';
import { selectorOptions } from '../../../../functions/index.mjs';
import { createSelectDatetimesState } from '../../../../hooks/index.mjs';
import {
  AnswerPageStore,
  holidaysJpDefinition$,
} from '../../../../store/index.mjs';
import { AddElementButton } from '../../../molecules/index.mjs';
import { MultipleDatePicker } from '../../../multiple-date-picker/index.mjs';
import { ButtonsWrapper } from '../../../styled/index.mjs';
import { DeleteAllButton } from '../../button-with-confirm/index.mjs';
import * as styles from '../select-datetimes.module.css';
import { SetTimesPopover } from '../set-times-popover/index.mjs';
import { SelectedDatetimeRow } from './selected-datetime-row.js';

const dc = dict.eventSettingsPage.section2;

type Props = Readonly<{
  datetimeSpecification: Bindable<DatetimeSpecificationEnumType>;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeList: Bindable<readonly DatetimeRange[]>;
  onDatetimeListChange: (list: readonly DatetimeRange[]) => void;
}>;

export const SelectDatetimes = ({
  datetimeSpecification,
  onDatetimeSpecificationChange,
  datetimeList,
  onDatetimeListChange,
}: Props): JSX.Element => {
  const datetimeList$ = toObservable(datetimeList);

  const {
    selectedDates$,
    onSelectedDatesChange,
    mostFrequentTimeRange$,
    onYmdChange,
    onRangeStartChange,
    onRangeEndChange,
    onDuplicateClick,
    onDeleteClick,
    onAddDatetimeClick,
    onConfirmDeleteAll,
    onSetTimesPopoverSubmit,
    onSortClick,
  } = createSelectDatetimesState(datetimeList$, onDatetimeListChange);

  return (
    <div class={constant(styles.root)}>
      <div>
        <div class={constant(styles.section)}>
          <div>{constant(dc.datetimeSpecification)}</div>
          <HtmlSelect
            value={datetimeSpecification}
            onChange={({ currentTarget }) => {
              onDatetimeSpecificationChange(
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                currentTarget.value as DatetimeSpecificationEnumType,
              );
            }}
          >
            {selectorOptions.map(({ label, value }) => (
              <option value={constant(value)}>{constant(label)}</option>
            ))}
          </HtmlSelect>
        </div>
        <div
          class={constant(styles.section)}
          data-e2e={constant('datetime-list')}
        >
          <For items={datetimeList$} key={(_, index) => index}>
            {(datetimeRange$, index$) => {
              const index = (): ReturnType<typeof asUint32> =>
                asUint32(Optional.unwrap(index$.getSnapshot()));

              return (
                <SelectedDatetimeRow
                  datetimeRange={datetimeRange$}
                  datetimeSpecification={datetimeSpecification}
                  onDeleteClick={() => {
                    onDeleteClick(index());
                  }}
                  onDuplicateClick={() => {
                    onDuplicateClick(index());
                  }}
                  onRangeEndChange={(hm) => {
                    onRangeEndChange(index(), hm);
                  }}
                  onRangeStartChange={(hm) => {
                    onRangeStartChange(index(), hm);
                  }}
                  onYmdChange={(ymd) => {
                    onYmdChange(index(), ymd);
                  }}
                />
              );
            }}
          </For>
          <AddElementButton onClick={onAddDatetimeClick} />
        </div>
        <ButtonsWrapper>
          <DeleteAllButton onConfirmDeleteAll={onConfirmDeleteAll} />
          <SetTimesPopover
            datetimeSpecification={datetimeSpecification}
            initialValue={mostFrequentTimeRange$}
            onSetTimesSubmit={onSetTimesPopoverSubmit}
          />
          <Button
            icon={'sort-asc'}
            intent={'primary'}
            text={constant(dc.sortDatetimes)}
            onClick={onSortClick}
          />
        </ButtonsWrapper>
      </div>
      <MultipleDatePicker
        holidaysJpDefinition={holidaysJpDefinition$}
        selectedDates={selectedDates$}
        setYearMonth$={AnswerPageStore.setYearMonth$}
        onSelectedDatesChange={onSelectedDatesChange}
      />
    </div>
  );
};
