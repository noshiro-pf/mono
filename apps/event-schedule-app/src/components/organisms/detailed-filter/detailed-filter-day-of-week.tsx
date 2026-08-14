import { CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { type AnswerFilterState } from '../../../functions/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import {
  CheckboxWithBottomLabel,
  CheckboxWrapper,
  FilterItem,
  FilterItemContent,
  VerticalCheckboxesWrapper,
} from './styled.js';

const dc = dict.answerPage.detailedFilter;

type Props = Readonly<{ state: AnswerFilterState['dayOfWeek'] }>;

/* 曜日で絞り込み */
export const DetailedFilterDayOfWeek = memoNamed<Props>(
  'DetailedFilterDayOfWeek',
  ({ state }) => (
    <>
      <FilterItem>
        <CheckboxWrapper>
          <CheckboxView
            state={state.enabled ? 'checked' : 'none'}
            onCheck={AnswerFilterAndSortStore.setEnabledFilteringByDayOfWeek}
          />
          <span>{dc.filterItems.dayOfWeek.title}</span>
        </CheckboxWrapper>
      </FilterItem>

      <FilterItemContent>
        <VerticalCheckboxesWrapper>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Sun ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setSundayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Sun.abbr}
          </CheckboxWithBottomLabel>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Mon ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setMondayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Mon.abbr}
          </CheckboxWithBottomLabel>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Tue ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setTuesdayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Tue.abbr}
          </CheckboxWithBottomLabel>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Wed ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setWednesdayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Wed.abbr}
          </CheckboxWithBottomLabel>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Thr ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setThursdayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Thr.abbr}
          </CheckboxWithBottomLabel>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Fri ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setFridayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Fri.abbr}
          </CheckboxWithBottomLabel>
          <CheckboxWithBottomLabel>
            <CheckboxView
              disabled={!state.enabled}
              state={state.value.Sat ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setSaturdayCheck}
            />
            {dc.filterItems.dayOfWeek.items.Sat.abbr}
          </CheckboxWithBottomLabel>
        </VerticalCheckboxesWrapper>
      </FilterItemContent>
    </>
  ),
);
