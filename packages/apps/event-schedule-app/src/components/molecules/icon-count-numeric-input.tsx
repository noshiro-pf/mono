import { clampAndRoundNumIcons } from '../../constants';
import { NumericInputView, useNumericInputState } from '../bp';

type Props = Readonly<{
  count: number;
  max: number;
  disabled?: boolean;
  onCountChange: (value: number) => void;
}>;

const defaultValue = 0;

export const IconCountNumericInput = memoNamed<Props>(
  'IconCountNumericInput',
  ({ count: valueFromProps, max, disabled = false, onCountChange }) => {
    const normalizeValue = useCallback(
      (value: number): number => clampAndRoundNumIcons(value, max),
      [max],
    );

    const {
      valueAsStr,
      setValueStr,
      onDecrementMouseDown,
      onIncrementMouseDown,
      onInputBlur,
      onKeyDown,
    } = useNumericInputState({
      onValueChange: onCountChange,
      defaultValue,
      normalizeValue,
      valueFromProps,
      step: 1,
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
        valueAsStr={valueAsStr}
        onDecrementMouseDown={onDecrementMouseDown}
        onIncrementMouseDown={onIncrementMouseDown}
        onInputBlur={onInputBlur}
        onInputStringChange={setValueStr}
      />
    );
  },
);
