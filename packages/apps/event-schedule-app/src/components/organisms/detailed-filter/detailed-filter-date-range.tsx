import { type AnswerFilterState } from '../../../functions';
import { AnswerFilterAndSortStore } from '../../../store';
import { BpDateRangeInput, CheckboxView } from '../../bp';
import { CheckboxWrapper, FilterItem, FilterItemContent } from './styled';

const dc = dict.answerPage.detailedFilter;

type Props = DeepReadonly<{
  state: AnswerFilterState['dateRange'];
  dateRange:
    | {
        start: YearMonthDate;
        end: YearMonthDate;
      }
    | undefined;
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
          singleMonthOnly={true}
          startInputProps={dateRangeInputStyle}
          onDateRangeChange={AnswerFilterAndSortStore.setDateRange}
        />
      </FilterItemContent>
    </>
  ),
);

const dateRangeInputStyle = { style: { width: '100px' } };
