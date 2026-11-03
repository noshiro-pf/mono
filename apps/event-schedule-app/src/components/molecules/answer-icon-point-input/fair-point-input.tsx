import { constant, type Bindable, type JSX } from 'synstate-dom';
import {
  answerIconPointConfig,
  clampAndRoundAnswerFairIconPoint,
} from '../../../constants/index.mjs';
import { AppNumericInput } from '../app-numeric-input.js';

type Props = Readonly<{
  value: Bindable<AnswerIconPoint>;
  onValueChange: (value: AnswerIconPoint) => void;
  disabled: Bindable<boolean>;
}>;

const {
  step,
  fair: { max, min },
} = answerIconPointConfig;

export const AnswerIconFairPointInput = ({
  value,
  onValueChange,
  disabled,
}: Props): JSX.Element => (
  <AppNumericInput
    disabled={disabled}
    max={constant(max)}
    min={constant(min)}
    normalize={clampAndRoundAnswerFairIconPoint}
    step={step}
    value={value}
    onValueChange={onValueChange}
  />
);
