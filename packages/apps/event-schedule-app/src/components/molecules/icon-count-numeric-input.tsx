import { useNumericInputWithStepState } from '@noshiro/numeric-input-utils';
import { NumericInputView } from '@noshiro/react-blueprintjs-utils';
import {
  clampAndRoundNumIcons,
  iconFilterNumericInputConfig,
} from '../../constants';

type Props = Readonly<{
  count: SafeUint;
  onCountChange: (value: SafeUint) => void;
  disabled?: boolean;
  max: SafeUint;
}>;

export const IconCountNumericInput = memoNamed<Props>(
  'IconCountNumericInput',
  ({ count: valueFromProps, max, disabled = false, onCountChange }) => {
    const normalizeValue = useCallback(
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
      decode: (s) => normalizeValue(Number(s)),
      encode: (s) => s.toString(),
      valueFromProps,
      step: iconFilterNumericInputConfig.step,
    });

    const inputProps = useMemo(
      () => ({ min: 0, max, onKeyDown }),
      [max, onKeyDown],
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
