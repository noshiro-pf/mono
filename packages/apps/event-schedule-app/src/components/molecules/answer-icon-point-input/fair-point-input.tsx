import {
  NumericInputView,
  useNumericInputState,
} from '@noshiro/react-blueprintjs-utils';
import {
  answerIconPointConfig,
  clampAndRoundAnswerFairIconPoint,
} from '../../../constants';

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
      valueAsStr,
      setValueAsStr,
      onDecrementMouseDown,
      onIncrementMouseDown,
      submit,
      onKeyDown,
    } = useNumericInputState<AnswerIconPoint>({
      onValueChange,
      normalize: clampAndRoundAnswerFairIconPoint,
      decode: (s) => clampAndRoundAnswerFairIconPoint(Number(s)),
      encode: (s) => s.toString(),
      valueFromProps,
      step,
    });

    const inputProps = useMemo(
      () => ({
        min,
        max,
        step,
        onKeyDown,
      }),
      [onKeyDown],
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
        onInputBlur={submit}
        onInputStringChange={setValueAsStr}
      />
    );
  },
);
