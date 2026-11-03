import { RangeSlider } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import type { FixedLengthTuple } from 'ts-type-forge';
import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
  dict,
} from '../../../constants/index.mjs';
import { AnswerFilterAndSortStore } from '../../../store/index.mjs';
import { CheckboxView, ScoreNumericInput } from '../../molecules/index.mjs';
import { filterView } from './filter-state.mjs';
import {
  CheckboxWrapper,
  FilterItem,
  FilterItemContent,
  RangeSliderWrapper,
} from './styled.js';
import * as styles from './styled.module.css';

const dc = dict.answerPage.detailedFilter;

const { min, max, step } = answersScoreNumericInputConfig;

/* スコアで絞り込み */
export const DetailedFilterScoreRange = (): JSX.Element => {
  const disabled = filterView((s) => !s.scoreRange.enabled);

  return (
    <>
      <FilterItem>
        <CheckboxWrapper>
          <CheckboxView
            state={filterView((s) =>
              s.scoreRange.enabled ? 'checked' : 'none',
            )}
            onCheck={AnswerFilterAndSortStore.setEnabledFilteringByScoreRange}
          />
          <span>{constant(dc.filterItems.score)}</span>
        </CheckboxWrapper>
      </FilterItem>
      <FilterItemContent>
        <div class={constant(styles.scoreInputs)}>
          <ScoreNumericInput
            disabled={disabled}
            max={filterView((s) => s.scoreRange.value.max)}
            score={filterView((s) => s.scoreRange.value.min)}
            onScoreChange={AnswerFilterAndSortStore.setScoreRangeMin}
          />
          <ScoreNumericInput
            disabled={disabled}
            min={filterView((s) => s.scoreRange.value.min)}
            score={filterView((s) => s.scoreRange.value.max)}
            onScoreChange={AnswerFilterAndSortStore.setScoreRangeMax}
          />
        </div>
        <RangeSliderWrapper>
          <RangeSlider
            disabled={disabled}
            labelPrecision={labelPrecision}
            labelValues={[min, max]}
            max={max}
            min={min}
            stepSize={step}
            value={filterView(({ scoreRange: { value } }) => [
              clampAndRoundAnswersScore(value.min),
              clampAndRoundAnswersScore(value.max),
            ])}
            onChange={setRange}
            onRelease={setRange}
          />
        </RangeSliderWrapper>
      </FilterItemContent>
    </>
  );
};

/** As many digits as the step has, as the slider before labelled its ends. */
const labelPrecision = 2;

const setRange = ([low, high]: FixedLengthTuple<2, number>): void => {
  AnswerFilterAndSortStore.setScoreRangeMin(clampAndRoundAnswersScore(low));

  AnswerFilterAndSortStore.setScoreRangeMax(clampAndRoundAnswersScore(high));
};
