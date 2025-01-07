import { BpRangeSlider, CheckboxView } from '@noshiro/react-blueprintjs-utils';
import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../../constants';
import { AnswerFilterAndSortStore } from '../../../store';
import { type AnswersScore } from '../../../types';
import { ScoreNumericInput } from '../../molecules';
import {
  CheckboxWrapper,
  FilterItem,
  FilterItemContent,
  RangeSliderWrapper,
} from './styled';

const dc = dict.answerPage.detailedFilter;

type Props = DeepReadonly<{
  enabled: boolean;
  range: {
    min: AnswersScore;
    max: AnswersScore;
  };
}>;

/* スコアで絞り込み */
export const DetailedFilterScoreRange = memoNamed<Props>(
  'DetailedFilterScoreRange',
  ({ enabled, range }) => {
    const sliderStateNormalized = useMemo(
      () => ({
        min: clampAndRoundAnswersScore(range.min),
        max: clampAndRoundAnswersScore(range.max),
      }),
      [range],
    );

    return (
      <>
        <FilterItem>
          <CheckboxWrapper>
            <CheckboxView
              state={enabled ? 'checked' : 'none'}
              onCheck={AnswerFilterAndSortStore.setEnabledFilteringByScoreRange}
            />
            <span>{dc.filterItems.score}</span>
          </CheckboxWrapper>
        </FilterItem>
        <FilterItemContent>
          <div
            css={css`
              display: flex;
              margin-right: 40px;
              margin-bottom: 5px;

              & > * {
                margin: 3px;
              }
            `}
          >
            <ScoreNumericInput
              disabled={!enabled}
              max={range.max}
              score={range.min}
              onScoreChange={AnswerFilterAndSortStore.setScoreRangeMin}
            />
            <ScoreNumericInput
              disabled={!enabled}
              min={range.min}
              score={range.max}
              onScoreChange={AnswerFilterAndSortStore.setScoreRangeMax}
            />
          </div>
          <RangeSliderWrapper>
            <BpRangeSlider
              disabled={!enabled}
              max={answersScoreNumericInputConfig.max}
              min={answersScoreNumericInputConfig.min}
              range={sliderStateNormalized}
              stepSize={answersScoreNumericInputConfig.step}
              onRangeMaxChange={onRangeMaxChange}
              onRangeMaxRelease={onRangeMaxRelease}
              onRangeMinChange={onRangeMinChange}
              onRangeMinRelease={onRangeMinRelease}
            />
          </RangeSliderWrapper>
        </FilterItemContent>
      </>
    );
  },
);

const onRangeMinChange = (a: number): void => {
  AnswerFilterAndSortStore.setScoreRangeMin(clampAndRoundAnswersScore(a));
};

const onRangeMaxChange = (a: number): void => {
  AnswerFilterAndSortStore.setScoreRangeMax(clampAndRoundAnswersScore(a));
};

const onRangeMinRelease = (a: number): void => {
  AnswerFilterAndSortStore.setScoreRangeMin(clampAndRoundAnswersScore(a));
};

const onRangeMaxRelease = (a: number): void => {
  AnswerFilterAndSortStore.setScoreRangeMax(clampAndRoundAnswersScore(a));
};
