import { NumericInput } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import * as styles from './bounded-numeric-input.module.css';
import { decodeNumber } from './decode-number.mjs';
import { normalizeNumber } from './normalize-number.mjs';

type Props<N extends number> = Readonly<{
  value: Bindable<N>;
  onValueChange: (value: N) => void;
  /** The value a number in range is, such as a branded type's `cast`. */
  toValue: (value: number) => N;
  min: number;
  /** Required: an input with no upper bound commits any number it is given. */
  max: number;
  /** Rounds to a whole number. */
  integer?: boolean;
  'data-e2e': string;
}>;

/**
 * A numeric input of the page: right-aligned, the width of its row, and
 * committed as a number in `[min, max]`, which `NumericInput` clamps to. Text
 * that is no number is committed as `min`, which is also where a step from it
 * starts; a number too large for a double, as the bound it is past.
 */
export const BoundedNumericInput = <N extends number>({
  value,
  onValueChange,
  toValue,
  min,
  max,
  integer = false,
  'data-e2e': e2e,
}: Props<N>): JSX.Element => {
  const normalize = normalizeNumber({ fallback: min, integer });

  return (
    <NumericInput
      data-e2e={constant(e2e)}
      decode={decodeNumber}
      encode={encode}
      fill
      inputClass={styles.input}
      max={constant(max)}
      min={constant(min)}
      normalize={(n) => toValue(normalize(n))}
      selectAllOnFocus
      value={value}
      onValueChange={onValueChange}
    />
  );
};

const encode = (value: number): string => value.toString();
