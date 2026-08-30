import { useNumericInputWithStepState } from 'numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';
import {
  answerRankNumericInputConfig,
  clampAndRoundAnswerRank,
} from '../../constants/index.mjs';
import { type AnswerRank } from '../../types/index.mjs';

type Props = Readonly<{
  value: AnswerRank;
  onValueChange: (value: AnswerRank) => void;
  disabled?: boolean;
}>;

const { majorStep: step, min, max } = answerRankNumericInputConfig;

export const RankNumericInput = memoNamed<Props>(
  'RankNumericInput',
  ({ value: valueFromProps, disabled = false, onValueChange }) => {
    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState({
      onValueChange,
      normalize: clampAndRoundAnswerRank,
      decode: (s) =>
        clampAndRoundAnswerRank(
          Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN),
        ),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = React.useMemo(
      () => ({ min, max, step, onKeyDown }),
      [onKeyDown],
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
