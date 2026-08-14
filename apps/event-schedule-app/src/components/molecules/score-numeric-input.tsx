import { useNumericInputWithStepState } from 'numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';
import {
  answersScoreNumericInputConfig,
  clampAndRoundAnswersScore,
} from '../../constants/index.mjs';
import { type AnswersScore } from '../../types/index.mjs';

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
    const normalizeValue = React.useCallback(
      (value: number) => clampAndRoundAnswersScore(Num.clamp(value, min, max)),
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
      decode: (s) =>
        clampAndRoundAnswersScore(
          Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN),
        ),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = React.useMemo(
      () => ({ min, max, step, onKeyDown }),
      [min, max, onKeyDown],
    );

    return (
      <NumericInputView
        disabled={disabled}
        fillSpace
        inputProps={inputProps}
        selectOnFocus
        valueAsStr={state}
        onDecrementMouseDown={onDecrementMouseDown}
        onIncrementMouseDown={onIncrementMouseDown}
        onInputBlur={submit}
        onInputStringChange={setState}
      />
    );
  },
);
