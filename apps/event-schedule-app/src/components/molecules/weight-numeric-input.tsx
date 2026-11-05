import { constant, type Bindable, type JSX } from 'synstate-dom';
import {
  clampAndRoundAnswerWeight,
  weightNumericInputConfig,
} from '../../constants/index.mjs';
import { AppNumericInput } from './app-numeric-input.js';

type Props = Readonly<{
  weight: Bindable<Weight>;
  onWeightChange: (value: Weight) => void;
  disabled?: Bindable<boolean>;
}>;

const { step, min, max } = weightNumericInputConfig;

export const WeightNumericInput = ({
  weight,
  disabled,
  onWeightChange,
}: Props): JSX.Element => (
  <AppNumericInput
    disabled={disabled}
    max={constant(max)}
    min={constant(min)}
    normalize={clampAndRoundAnswerWeight}
    step={step}
    value={weight}
    onValueChange={onWeightChange}
  />
);
