import { useNumericInputWithStepState } from '@noshiro/numeric-input-utils';
import { NumericInputView } from '@noshiro/react-blueprintjs-utils';
import {
  clampAndRoundAnswerWeight,
  weightNumericInputConfig,
} from '../../constants';

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
      decode: (s) => clampAndRoundAnswerWeight(Number(s)),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({ min, max, step, onKeyDown }),
      [onKeyDown],
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
