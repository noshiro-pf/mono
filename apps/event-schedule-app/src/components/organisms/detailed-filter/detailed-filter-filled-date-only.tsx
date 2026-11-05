import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxView } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import { CheckboxWrapper, FilterItem } from './styled.js';

const dc = dict.answerPage.detailedFilter;

/* 全員回答済みの候補日のみ表示 */
export const DetailedFilterFilledDateOnly = (): JSX.Element => (
  <FilterItem>
    <CheckboxWrapper data-e2e={'filled-date-only-filter'}>
      <CheckboxView
        state={filterView((s) => (s.filledDateOnly ? 'checked' : 'none'))}
        onCheck={AnswerFilterAndSortStore.setOnlyFilledDate}
      />
      <span>{constant(dc.filterItems.filledDateOnly)}</span>
    </CheckboxWrapper>
  </FilterItem>
);
