import { useNumericInputWithStepState } from 'numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';
import { PercentFloat } from '../../types/index.mjs';

type Props = Readonly<{
  value: PercentFloat;
  onValueChange: (value: PercentFloat) => void;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  cyId?: string;
}>;

export const PercentFloatNumericInput = memoNamed<Props>(
  'PercentFloatNumericInput',
  ({
    cyId,
    value: valueFromProps,
    disabled = false,
    onValueChange,
    min,
    max,
    step = 1,
  }) => {
    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState<PercentFloat>({
      onValueChange,
      normalize: (n) => PercentFloat.cast(n),
      decode: (s) =>
        PercentFloat.cast(Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN)),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = React.useMemo(
      () => ({ min, max, step, onKeyDown, 'data-e2e': cyId }),
      [max, min, step, onKeyDown, cyId],
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
