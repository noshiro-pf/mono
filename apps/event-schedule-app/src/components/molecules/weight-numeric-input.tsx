import { useNumericInputWithStepState } from 'numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';
import {
  clampAndRoundAnswerWeight,
  weightNumericInputConfig,
} from '../../constants/index.mjs';

type Props = Readonly<{
  weight: Weight;
  onWeightChange: (value: Weight) => void;
  disabled?: boolean;
}>;

const { step, min, max } = weightNumericInputConfig;

export const WeightNumericInput = memoNamed<Props>(
  'WeightNumericInput',
  ({
    weight: valueFromProps,
    disabled = false,
    onWeightChange: onValueChange,
  }) => {
    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState<Weight>({
      onValueChange,
      normalize: clampAndRoundAnswerWeight,
      decode: (s) =>
        clampAndRoundAnswerWeight(
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
