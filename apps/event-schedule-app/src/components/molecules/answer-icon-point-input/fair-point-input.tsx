import { useNumericInputWithStepState } from 'numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';
import {
  answerIconPointConfig,
  clampAndRoundAnswerFairIconPoint,
} from '../../../constants/index.mjs';

type Props = Readonly<{
  value: AnswerIconPoint;
  onValueChange: (value: AnswerIconPoint) => void;
  disabled: boolean;
}>;

const {
  step,
  fair: { max, min },
} = answerIconPointConfig;

export const AnswerIconFairPointInput = memoNamed<Props>(
  'AnswerIconFairPointInput',
  ({ value: valueFromProps, onValueChange, disabled }) => {
    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState<AnswerIconPoint>({
      onValueChange,
      normalize: clampAndRoundAnswerFairIconPoint,
      decode: (s) =>
        clampAndRoundAnswerFairIconPoint(
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
