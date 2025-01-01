import { useNumericInputState } from '@noshiro/numeric-input-utils';
import * as React from 'react';
import { NumericInputView } from './numeric-input-view';
import { ScoreType } from './score-type';

type Props = Readonly<{
  score: ScoreType;
  onScoreChange: (value: ScoreType) => void;
  disabled?: boolean;
}>;

const { step, min, max } = ScoreType;

export const ScoreNumericInput = React.memo<Props>((props) => {
  const { score, disabled = false, onScoreChange } = props;

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
      onValueChange={onValueAsStrChange}
    />
  );
});
