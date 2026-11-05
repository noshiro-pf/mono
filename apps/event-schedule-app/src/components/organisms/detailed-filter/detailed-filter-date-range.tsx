import { DateRangeInput, type DayRange } from 'blueprint-synstate';
import { constant, For, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import {
  formatDateInputText,
  parseDateInputText,
  ymdFromDayValue,
  ymdToDayValue,
} from '../../../functions/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxView } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import { CheckboxWrapper, FilterItem, FilterItemContent } from './styled.js';
import * as styles from './styled.module.css';

const dc = dict.answerPage.detailedFilter;

/* 日時範囲で絞り込み */
export const DetailedFilterDateRange = (): JSX.Element => (
  <>
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={filterView((s) => (s.dateRange.enabled ? 'checked' : 'none'))}
          onCheck={AnswerFilterAndSortStore.setEnabledFilteringByDateRange}
        />
        <span>{constant(dc.filterItems.datetimeRange)}</span>
      </CheckboxWrapper>
    </FilterItem>

    <FilterItemContent>
      {/* Drawn again when the event's dates change, which bound the range. */}
      <For
        items={filterView((s) => [s.dateRange.defaultValue] as const)}
        key={(bounds) =>
          bounds === undefined
            ? ''
            : `${ymdToDayValue(bounds.start)}/${ymdToDayValue(bounds.end)}`
        }
      >
        {(bounds$) => {
          const bounds = bounds$.getSnapshot().value;

          return (
            <DateRangeInput
              disabled={filterView((s) => !s.dateRange.enabled)}
              endInputProps={{ class: styles.dateRangeField }}
              formatDate={formatDateInputText}
              maxDate={
                bounds === undefined ? undefined : ymdToDayValue(bounds.end)
              }
              minDate={
                bounds === undefined ? undefined : ymdToDayValue(bounds.start)
              }
              parseDate={(text) => parseDateInputText(text)}
              startInputProps={{ class: styles.dateRangeField }}
              value={filterView(({ dateRange: { value } }): DayRange => [
                value.start === undefined ? '' : ymdToDayValue(value.start),
                value.end === undefined ? '' : ymdToDayValue(value.end),
              ])}
              onChange={([start, end]) => {
                AnswerFilterAndSortStore.setDateRange({
                  start: ymdFromDayValue(start),
                  end: ymdFromDayValue(end),
                });
              }}
            />
          );
        }}
      </For>
    </FilterItemContent>
  </>
);
