import {
  clampAndRoundAnswerWeight,
  weightNumericInputConfig,
} from '../../constants';
import { NumericInputView, useNumericInputState } from '../bp';

type Props = Readonly<{
  weight: Weight;
  onWeightChange: (value: Weight) => void;
  disabled?: boolean;
}>;

const { step, defaultValue, min, max } = weightNumericInputConfig;

export const WeightNumericInput = memoNamed<Props>(
  'WeightNumericInput',
  ({
    weight: valueFromProps,
    disabled = false,
    onWeightChange: onValueChange,
  }) => {
    const {
      valueAsStr,
      setValueStr,
      onDecrementMouseDown,
      onIncrementMouseDown,
      onInputBlur,
      onKeyDown,
    } = useNumericInputState({
      onValueChange,
      defaultValue,
      normalizeValue: clampAndRoundAnswerWeight,
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({ min, max, step, onKeyDown }),
      [onKeyDown]
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
  }
);
