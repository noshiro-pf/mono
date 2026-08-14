import { Collapse } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { CheckboxView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { expectType } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { DetailedFilterDateRange } from './detailed-filter-date-range.js';
import { DetailedFilterDayOfWeek } from './detailed-filter-day-of-week.js';
import { DetailedFilterFilledDateOnly } from './detailed-filter-filled-date-only.js';
import { DetailedFilterIconOfSpecifiedRespondent } from './detailed-filter-icon-of-specified-respondent.js';
import { DetailedFilterNumFairIcon } from './detailed-filter-num-fair-icon.js';
import { DetailedFilterNumFairPlusPoorIcon } from './detailed-filter-num-fair-plus-poor-icon.js';
import { DetailedFilterNumGoodIcon } from './detailed-filter-num-good-icon.js';
import { DetailedFilterNumGoodPlusFairIcon } from './detailed-filter-num-good-plus-fair-icon.js';
import { DetailedFilterNumPoorIcon } from './detailed-filter-num-poor-icon.js';
import { DetailedFilterRank } from './detailed-filter-rank.js';
import { DetailedFilterScoreRange } from './detailed-filter-score-range.js';
import { CheckboxWrapper, FilterItem, FilterItemContent } from './styled.js';

type Props = DeepReadonly<{ isOpen: boolean }>;

export const DetailedFilterCollapse = memoNamed<Props>(
  'DetailedFilterCollapse',
  ({ isOpen }) => {
    const {
      dateRange,
      dayOfWeek,
      filledDateOnly,
      iconOfSpecifiedRespondent,
      respondent,
      iconState,
      scoreRange,
      rank,
      ..._rest
    } = AnswerFilterAndSortStore.useFilterState();

    expectType<keyof typeof _rest, never>('=');

    const iconOfSpecifiedRespondentCheckState = useObservableValue(
      AnswerFilterAndSortStore.iconOfSpecifiedRespondentCheckState$,
    );

    const filteredRespondentCheckState = useObservableValue(
      AnswerFilterAndSortStore.respondentCheckState$,
    );

    return (
      <Collapse isOpen={isOpen}>
        <div
          css={css`
            margin-bottom: 10px;
            overflow-x: auto;
          `}
        >
          <div
            css={css`
              padding: 10px;
              width: 350px;
              border: solid 1px rgba(16, 22, 26, 0.15);
              border-radius: 10px;
            `}
          >
            <DetailedFilterDateRange
              dateRange={dateRange.defaultValue}
              state={dateRange}
            />

            <DetailedFilterDayOfWeek state={dayOfWeek} />

            <DetailedFilterScoreRange
              enabled={scoreRange.enabled}
              range={scoreRange.value}
            />

            <DetailedFilterRank enabled={rank.enabled} rank={rank.value} />

            <hr />

            <div
              css={css`
                margin-top: 20px;
                margin-bottom: 15px;
              `}
            >
              {dict.answerPage.detailedFilter.filterItems.answerIcon}
            </div>

            <DetailedFilterNumGoodIcon
              enabled={iconState.good.enabled}
              max={iconState.good.max}
              min={iconState.good.min}
              upperLimit={iconState.upperLimit}
            />
            <DetailedFilterNumFairIcon
              enabled={iconState.fair.enabled}
              max={iconState.fair.max}
              min={iconState.fair.min}
              upperLimit={iconState.upperLimit}
            />
            <DetailedFilterNumPoorIcon
              enabled={iconState.poor.enabled}
              max={iconState.poor.max}
              min={iconState.poor.min}
              upperLimit={iconState.upperLimit}
            />

            <DetailedFilterNumGoodPlusFairIcon
              enabled={iconState.goodPlusFair.enabled}
              max={iconState.goodPlusFair.max}
              min={iconState.goodPlusFair.min}
              upperLimit={iconState.upperLimit}
            />
            <DetailedFilterNumFairPlusPoorIcon
              enabled={iconState.fairPlusPoor.enabled}
              max={iconState.fairPlusPoor.max}
              min={iconState.fairPlusPoor.min}
              upperLimit={iconState.upperLimit}
            />

            <DetailedFilterFilledDateOnly filledDateOnly={filledDateOnly} />

            <DetailedFilterIconOfSpecifiedRespondent
              checkState={iconOfSpecifiedRespondentCheckState}
              enabled={iconOfSpecifiedRespondent.enabled}
              fairDisabled={
                iconState.fair.max === 0 ||
                iconState.goodPlusFair.max === 0 ||
                iconState.fairPlusPoor.max === 0
              }
              goodDisabled={
                iconState.good.max === 0 || iconState.goodPlusFair.max === 0
              }
              noneDisabled={filledDateOnly}
              poorDisabled={
                iconState.poor.max === 0 || iconState.fairPlusPoor.max === 0
              }
            />

            <hr />

            <div
              css={css`
                margin-top: 20px;
                margin-bottom: 15px;
              `}
            >
              {dict.answerPage.detailedFilter.filterItems.filterOutSomeAnswer}
            </div>

            <FilterItem>
              <CheckboxWrapper>
                <CheckboxView
                  state={respondent.enabled ? 'checked' : 'none'}
                  onCheck={
                    AnswerFilterAndSortStore.setEnabledFilteringByRespondent
                  }
                />
                <span>
                  {dict.answerPage.detailedFilter.filterItems.respondent.title}
                </span>
              </CheckboxWrapper>
            </FilterItem>
            <FilterItemContent>
              {filteredRespondentCheckState.map(
                ({ username, checkState, key: _key }, index) => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    css={css`
                      display: flex;
                      align-items: center;
                    `}
                  >
                    <CheckboxWrapper>
                      <CheckboxView
                        disabled={!respondent.enabled}
                        state={checkState.checked ? 'checked' : 'none'}
                        onCheck={checkState.onCheck}
                      />
                      <span>{username}</span>
                    </CheckboxWrapper>
                  </div>
                ),
              )}
            </FilterItemContent>
          </div>
        </div>
      </Collapse>
    );
  },
);
