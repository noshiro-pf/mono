import { constant, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxView } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import {
  CheckboxWithBottomLabel,
  CheckboxWrapper,
  FilterItem,
  FilterItemContent,
  VerticalCheckboxesWrapper,
} from './styled.js';

const dc = dict.answerPage.detailedFilter;

const days = [
  ['Sun', AnswerFilterAndSortStore.setSundayCheck],
  ['Mon', AnswerFilterAndSortStore.setMondayCheck],
  ['Tue', AnswerFilterAndSortStore.setTuesdayCheck],
  ['Wed', AnswerFilterAndSortStore.setWednesdayCheck],
  ['Thr', AnswerFilterAndSortStore.setThursdayCheck],
  ['Fri', AnswerFilterAndSortStore.setFridayCheck],
  ['Sat', AnswerFilterAndSortStore.setSaturdayCheck],
] as const;

/* 曜日で絞り込み */
export const DetailedFilterDayOfWeek = (): JSX.Element => (
  <>
    <FilterItem>
      <CheckboxWrapper>
        <CheckboxView
          state={filterView((s) => (s.dayOfWeek.enabled ? 'checked' : 'none'))}
          onCheck={AnswerFilterAndSortStore.setEnabledFilteringByDayOfWeek}
        />
        <span>{constant(dc.filterItems.dayOfWeek.title)}</span>
      </CheckboxWrapper>
    </FilterItem>

    <FilterItemContent>
      <VerticalCheckboxesWrapper>
        {days.map(([day, onCheck]) => (
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={filterView((s) => !s.dayOfWeek.enabled)}
              state={filterView((s) =>
                s.dayOfWeek.value[day] ? 'checked' : 'none',
              )}
              onCheck={onCheck}
            />
            {constant(dc.filterItems.dayOfWeek.items[day].abbr)}
          </CheckboxWithBottomLabel>
        ))}
      </VerticalCheckboxesWrapper>
    </FilterItemContent>
  </>
);
