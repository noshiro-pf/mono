import { useNumericInputWithStepState } from '@noshiro/numeric-input-utils';
import { NumericInputView } from '@noshiro/react-blueprintjs-utils';
import { Yen } from '../../types';

type Props = Readonly<{
  value: Yen;
  onValueChange: (value: Yen) => void;
  disabled?: boolean;
  step?: number;
  min?: number;
  max?: number;
  cyId?: string;
}>;

export const YenNumericInput = memoNamed<Props>(
  'YenNumericInput',
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
    } = useNumericInputWithStepState<Yen>({
      onValueChange,
      normalize: (n) => Yen.cast(Number(n)),
      decode: (s) => Yen.cast(Number(s)),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({ min, max, step, onKeyDown, 'data-e2e': cyId }),
      [max, min, step, onKeyDown, cyId],
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
