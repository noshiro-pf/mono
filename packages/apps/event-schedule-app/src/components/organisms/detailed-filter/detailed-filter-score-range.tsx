import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../../constants';
import { AnswerFilterAndSortStore } from '../../../store';
import { type AnswersScore } from '../../../types';
import { BpRangeSlider, CheckboxView } from '../../bp';
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
  ({ enabled, range: rangeFromProps }) => {
    const { state: sliderState, setState: setSliderState } = useState<
      Readonly<{ min: number; max: number }>
    >({
      min: answersScoreNumericInputConfig.min,
      max: answersScoreNumericInputConfig.max,
    });

    const sliderStateNormalized = useMemo(
      () => ({
        min: clampAndRoundAnswersScore(sliderState.min),
        max: clampAndRoundAnswersScore(sliderState.max),
      }),
      [sliderState]
    );

    const onRelease = useCallback(() => {
      AnswerFilterAndSortStore.setScoreRange(sliderStateNormalized);
    }, [sliderStateNormalized]);

    const onMinChange = useCallback(
      (value: AnswersScore) => {
        AnswerFilterAndSortStore.setScoreRange({
          min: value,
          max: rangeFromProps.max,
        });
      },
      [rangeFromProps.max]
    );

    const onMaxChange = useCallback(
      (value: AnswersScore) => {
        AnswerFilterAndSortStore.setScoreRange({
          min: rangeFromProps.min,
          max: value,
        });
      },
      [rangeFromProps.min]
    );

    useEffect(() => {
      setSliderState(rangeFromProps);
    }, [rangeFromProps, setSliderState]);

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
          <NumericInputsWrapper>
            <ScoreNumericInput
              disabled={!enabled}
              max={rangeFromProps.max}
              value={rangeFromProps.min}
              onValueChange={onMinChange}
            />
            <ScoreNumericInput
              disabled={!enabled}
              min={rangeFromProps.min}
              value={rangeFromProps.max}
              onValueChange={onMaxChange}
            />
          </NumericInputsWrapper>
          <RangeSliderWrapper>
            <BpRangeSlider
              disabled={!enabled}
              max={answersScoreNumericInputConfig.max}
              min={answersScoreNumericInputConfig.min}
              range={sliderStateNormalized}
              stepSize={answersScoreNumericInputConfig.step}
              onChange={setSliderState}
              onRelease={onRelease}
            />
          </RangeSliderWrapper>
        </FilterItemContent>
      </>
    );
  }
);

const NumericInputsWrapper = styled.div`
  display: flex;
  margin-right: 40px;
  margin-bottom: 5px;

  & > * {
    margin: 3px;
  }
`;
