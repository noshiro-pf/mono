import { useNumericInputWithStepState } from 'numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { Num, Result } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
import {
  clampAndRoundNumIcons,
  iconFilterNumericInputConfig,
} from '../../constants/index.mjs';

type Props = Readonly<{
  count: SafeUint;
  onCountChange: (value: SafeUint) => void;
  disabled?: boolean;
  max: SafeUint;
}>;

export const IconCountNumericInput = memoNamed<Props>(
  'IconCountNumericInput',
  ({ count: valueFromProps, max, disabled = false, onCountChange }) => {
    const normalizeValue = React.useCallback(
      (value: number): SafeUint => clampAndRoundNumIcons(value, max),
      [max],
    );

    const {
      state,
      setState,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputWithStepState<SafeUint>({
      onValueChange: onCountChange,
      normalize: normalizeValue,
      decode: (s) =>
        normalizeValue(Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN)),
      encode: (s) => s.toString(),
      valueFromProps,
      step: iconFilterNumericInputConfig.step,
    });

    const inputProps = React.useMemo(
      () => ({ min: 0, max, onKeyDown }),
      [max, onKeyDown],
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
