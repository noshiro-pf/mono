// eslint-disable-next-line import/no-deprecated
import {
  answerIconPointConfig,
  clampAndRoundAnswerFairIconPoint,
} from '../../../constants';
import { NumericInputView, useNumericInputState } from '../../bp';

type Props = Readonly<{
  value: AnswerIconPoint;
  onValueChange: (value: AnswerIconPoint) => void;
  disabled: boolean;
}>;

const {
  step,
  fair: { defaultValue, max, min },
} = answerIconPointConfig;

export const AnswerIconFairPointInput = memoNamed<Props>(
  'AnswerIconFairPointInput',
  ({ value: valueFromProps, onValueChange, disabled }) => {
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
      normalizeValue: clampAndRoundAnswerFairIconPoint,
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
