/**
 * Mirror of the ECMAScript ToIntegerOrInfinity abstract operation for number
 * inputs: `NaN` becomes `0`, everything else truncates toward zero
 * (±Infinity stays ±Infinity, negative zero compares equal to `0`).
 *
 * The validate-first wrappers apply it to their numeric arguments before
 * range-checking, so their checks coincide exactly with the checks the
 * engine performs — e.g. `toFixed(x, 100.9)` is legal because the engine
 * truncates `100.9` to `100` before comparing.
 */
export const toIntegerOrInfinity = (value: number): number =>
  Number.isNaN(value) ? 0 : Math.trunc(value);
