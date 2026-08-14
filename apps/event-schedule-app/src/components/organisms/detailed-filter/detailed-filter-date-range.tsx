import { BpDateRangeInput, CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { type DeepReadonly } from 'ts-type-forge';
import { type AnswerFilterState } from '../../../functions/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxWrapper, FilterItem, FilterItemContent } from './styled.js';

const dc = dict.answerPage.detailedFilter;

type Props = DeepReadonly<{
  state: AnswerFilterState['dateRange'];
  dateRange: { start: YearMonthDate; end: YearMonthDate } | undefined;
}>;

/* 日時範囲で絞り込み */
export const DetailedFilterDateRange = memoNamed<Props>(
  'DetailedFilterDateRange',
  ({ state, dateRange }) => (
    <>
      <FilterItem>
        <CheckboxWrapper>
          <CheckboxView
            state={state.enabled ? 'checked' : 'none'}
            onCheck={AnswerFilterAndSortStore.setEnabledFilteringByDateRange}
          />
          <span>{dc.filterItems.datetimeRange}</span>
        </CheckboxWrapper>
      </FilterItem>

      <FilterItemContent>
        <BpDateRangeInput
          dateRange={state.value}
          disabled={!state.enabled}
          endInputProps={dateRangeInputStyle}
          maxDate={dateRange?.end}
          minDate={dateRange?.start}
          reverseMonthAndYearMenus={false}
          shortcuts={false}
          singleMonthOnly
          startInputProps={dateRangeInputStyle}
          onDateRangeChange={AnswerFilterAndSortStore.setDateRange}
        />
      </FilterItemContent>
    </>
  ),
);

const dateRangeInputStyle = { style: { width: '100px' } } as const;
