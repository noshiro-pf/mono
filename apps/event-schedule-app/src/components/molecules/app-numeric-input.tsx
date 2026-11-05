import { NumericInput } from 'blueprint-synstate';
import type { Bindable, JSX } from 'synstate-dom';
import { Num, Result } from 'ts-data-forge';
import * as styles from './app-numeric-input.module.css';

type Props<N extends number> = Readonly<{
  value: Bindable<N>;
  onValueChange: (value: N) => void;
  /** Clamps and rounds a number to an `N`; `NaN` becomes its default. */
  normalize: (value: number) => N;
  min: Bindable<number>;
  max: Bindable<number>;
  step: number;
  disabled?: Bindable<boolean>;
}>;

/**
 * A number setting's input: the full width, its text right-aligned and selected
 * on focus.
 */
export const AppNumericInput = <N extends number>({
  value,
  onValueChange,
  normalize,
  min,
  max,
  step,
  disabled,
}: Props<N>): JSX.Element => (
  <NumericInput
    decode={(text) => Result.unwrapOkOr(Num.safeParseFloat(text), Number.NaN)}
    disabled={disabled}
    encode={(n) => n.toString()}
    fill
    inputClass={styles.input}
    max={max}
    min={min}
    normalize={normalize}
    selectAllOnFocus
    step={step}
    value={value}
    onValueChange={onValueChange}
  />
);
