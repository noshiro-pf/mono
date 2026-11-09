import { Collapse } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, For, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxView } from '../../molecules/index.mjs';
import { DetailedFilterDateRange } from './detailed-filter-date-range.js';
import { DetailedFilterDayOfWeek } from './detailed-filter-day-of-week.js';
import { DetailedFilterFilledDateOnly } from './detailed-filter-filled-date-only.js';
import { DetailedFilterIconOfSpecifiedRespondent } from './detailed-filter-icon-of-specified-respondent.js';
import { DetailedFilterNumIcon } from './detailed-filter-num-icon.js';
import { DetailedFilterRank } from './detailed-filter-rank.js';
import { DetailedFilterScoreRange } from './detailed-filter-score-range.js';
import { filterView } from './filter-state.mjs';
import { CheckboxWrapper, FilterItem, FilterItemContent } from './styled.js';
import * as styles from './styled.module.css';

type Props = Readonly<{ isOpen: Bindable<boolean> }>;

const dc = dict.answerPage.detailedFilter.filterItems;

export const DetailedFilterCollapse = ({ isOpen }: Props): JSX.Element => (
  <Collapse isOpen={isOpen}>
    <div class={constant(styles.collapseScroll)}>
      <div
        class={constant(styles.collapseBox)}
        data-e2e={constant('detailed-filter')}
      >
        <DetailedFilterDateRange />
        <DetailedFilterDayOfWeek />
        <DetailedFilterScoreRange />
        <DetailedFilterRank />

        <hr />

        <div class={constant(styles.groupTitle)}>{constant(dc.answerIcon)}</div>

        <DetailedFilterNumIcon icon={'good'} />
        <DetailedFilterNumIcon icon={'fair'} />
        <DetailedFilterNumIcon icon={'poor'} />
        <DetailedFilterNumIcon icon={'goodPlusFair'} />
        <DetailedFilterNumIcon icon={'fairPlusPoor'} />

        <DetailedFilterFilledDateOnly />

        <DetailedFilterIconOfSpecifiedRespondent />

        <hr />

        <div class={constant(styles.groupTitle)}>
          {constant(dc.filterOutSomeAnswer)}
        </div>

        <FilterItem>
          <CheckboxWrapper>
            <CheckboxView
              state={filterView((s) =>
                s.respondent.enabled ? 'checked' : 'none',
              )}
              onCheck={AnswerFilterAndSortStore.setEnabledFilteringByRespondent}
            />
            <span>{constant(dc.respondent.title)}</span>
          </CheckboxWrapper>
        </FilterItem>
        <FilterItemContent>
          <For
            items={AnswerFilterAndSortStore.respondentCheckState$}
            key={(_, index) => index}
          >
            {(respondent$) => (
              <div class={constant(styles.respondentRow)}>
                <CheckboxWrapper>
                  <CheckboxView
                    disabled={filterView((s) => !s.respondent.enabled)}
                    state={respondent$.pipe(
                      map((r) => (r.checkState.checked ? 'checked' : 'none')),
                    )}
                    onCheck={(checked) => {
                      respondent$
                        .getSnapshot()
                        .value.checkState.onCheck(checked);
                    }}
                  />
                  <span>{respondent$.pipe(map((r) => r.username))}</span>
                </CheckboxWrapper>
              </div>
            )}
          </For>
        </FilterItemContent>
      </div>
    </div>
  </Collapse>
);
