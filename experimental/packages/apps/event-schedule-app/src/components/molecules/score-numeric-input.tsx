import { useNumericInputWithStepState } from '@noshiro/numeric-input-utils';
import { NumericInputView } from '@noshiro/react-blueprintjs-utils';
import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../constants';
import { type AnswersScore } from '../../types';

type Props = Readonly<{
  score: AnswersScore;
  onScoreChange: (value: AnswersScore) => void;
  disabled?: boolean;
  min?: AnswersScore;
  max?: AnswersScore;
}>;

const { majorStep: step } = answersScoreNumericInputConfig;

export const ScoreNumericInput = memoNamed<Props>(
  'ScoreNumericInput',
  ({
    score: valueFromProps,
    disabled = false,
    min = answersScoreNumericInputConfig.min,
    max = answersScoreNumericInputConfig.max,
    onScoreChange: onValueChange,
  }) => {
    const normalizeValue = useCallback(
      (value: number) =>
        clampAndRoundAnswersScore(Num.clamp<number>(min, max)(value)),
      [min, max],
    );

    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState({
      onValueChange,
      normalize: normalizeValue,
      decode: (s) => clampAndRoundAnswersScore(Number(s)),
      encode: (s) => s.toString(),
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
        valueAsStr={state}
        onDecrementMouseDown={onDecrementMouseDown}
        onIncrementMouseDown={onIncrementMouseDown}
        onInputBlur={submit}
        onInputStringChange={setState}
      />
    );
  },
);
