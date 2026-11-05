import { constant, type Bindable, type JSX } from 'synstate-dom';
import { asSafeUint } from 'ts-data-forge';
import type { SafeUint } from 'ts-type-forge';
import {
  clampAndRoundNumIcons,
  iconFilterNumericInputConfig,
} from '../../constants/index.mjs';
import { AppNumericInput } from './app-numeric-input.js';

type Props = Readonly<{
  count: Bindable<SafeUint>;
  onCountChange: (value: SafeUint) => void;
  disabled?: Bindable<boolean>;
  max: Bindable<SafeUint>;
}>;

export const IconCountNumericInput = ({
  count,
  max,
  disabled,
  onCountChange,
}: Props): JSX.Element => (
  <AppNumericInput
    disabled={disabled}
    max={max}
    min={constant(0)}
    // Already clamped to `max`, which the input does before this.
    normalize={(value) => clampAndRoundNumIcons(value, unbounded)}
    step={iconFilterNumericInputConfig.step}
    value={count}
    onValueChange={onCountChange}
  />
);

const unbounded = asSafeUint(Number.MAX_SAFE_INTEGER);
