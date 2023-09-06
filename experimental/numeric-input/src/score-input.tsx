import { useNumericInputState } from './numeric-input-state';
import { NumericInputView } from './numeric-input-view';
import { ScoreType } from './score';

type Props = Readonly<{
  score: ScoreType;
  onScoreChange: (value: ScoreType) => void;
  disabled?: boolean;
}>;

const { step, min, max } = ScoreType;

export const ScoreNumericInput = ({
  score,
  disabled = false,
  onScoreChange,
}: Props): JSX.Element => {
  const { valueAsStr, onValueAsStrChange, submit } = useNumericInputState({
    valueFromProps: score,
    onValueChange: onScoreChange,
    decode: ScoreType.decode,
    encode: ScoreType.encode,
  });

  return (
    <NumericInputView
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      value={valueAsStr}
      onBlur={submit}
      onChange={onValueAsStrChange}
    />
  );
};
