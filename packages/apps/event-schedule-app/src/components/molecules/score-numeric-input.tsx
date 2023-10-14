import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../constants';
import { type AnswersScore } from '../../types';
import { NumericInputView, useNumericInputState } from '../bp';

type Props = Readonly<{
  value: AnswersScore;
  disabled?: boolean;
  min?: AnswersScore;
  max?: AnswersScore;
  onValueChange: (value: AnswersScore) => void;
}>;

const step = answersScoreNumericInputConfig.majorStep;
const defaultValue = answersScoreNumericInputConfig.defaultValue;

export const ScoreNumericInput = memoNamed<Props>(
  'ScoreNumericInput',
  ({
    value: valueFromProps,
    disabled = false,
    min = answersScoreNumericInputConfig.min,
    max = answersScoreNumericInputConfig.max,
    onValueChange,
  }) => {
    const normalizeValue = useCallback(
      (value: number) =>
        clampAndRoundAnswersScore(Num.clamp<number>(min, max)(value)),
      [min, max],
    );

    const {
      valueAsStr,
      setValueStr,
      onDecrementMouseDown,
      onIncrementMouseDown,
      onInputBlur,
      onKeyDown,
    } = useNumericInputState({
      onValueChange,
      defaultValue,
      normalizeValue,
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({ min, max, step, onKeyDown }),
      [min, max, onKeyDown],
    );

    return (
      <NumericInputView
        disabled={disabled}
        fillSpace={true}
        inputProps={inputProps}
        selectOnFocus={true}
        valueAsStr={valueAsStr}
        onDecrementMouseDown={onDecrementMouseDown}
        onIncrementMouseDown={onIncrementMouseDown}
        onInputBlur={onInputBlur}
        onInputStringChange={setValueStr}
      />
    );
  },
);
