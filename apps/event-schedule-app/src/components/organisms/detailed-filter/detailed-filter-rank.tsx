import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxView, RankNumericInput } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import { CheckboxWrapper, FilterItem } from './styled.js';
import * as styles from './styled.module.css';

const dc = dict.answerPage.detailedFilter;

export const DetailedFilterRank = (): JSX.Element => (
  <FilterItem>
    <CheckboxWrapper>
      <CheckboxView
        state={filterView((s) => (s.rank.enabled ? 'checked' : 'none'))}
        onCheck={AnswerFilterAndSortStore.setEnabledFilteringByRank}
      />
    </CheckboxWrapper>
    <div class={constant(styles.rank)}>
      <span class={constant(styles.nowrap)}>
        {constant(dc.filterItems.rankPrefix)}
      </span>
      <div class={constant(styles.rankInput)}>
        <RankNumericInput
          disabled={filterView((s) => !s.rank.enabled)}
          value={filterView((s) => s.rank.value)}
          onValueChange={AnswerFilterAndSortStore.setRank}
        />
      </div>
      <span class={constant(styles.nowrap)}>
        {constant(dc.filterItems.rankSuffix)}
      </span>
    </div>
  </FilterItem>
);
