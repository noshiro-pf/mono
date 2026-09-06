import { Result } from 'ts-data-forge';

/**
 * Parses a string as a number without the `NaN` sentinel — the alternative
 * to calling `Number(str)`.
 *
 * `Number(str)` never throws; it reports failure as `NaN`, and turns the
 * empty (or whitespace-only) string into `0`. Both are sentinels that a
 * caller has to remember to check. This wrapper applies the same
 * StringToNumber conversion (so hexadecimal / exponent notation,
 * surrounding whitespace and `'Infinity'` parse exactly as `Number` parses
 * them) but reports a blank input or a `NaN` result as a tagged `Err`
 * carrying the original input.
 *
 * `Number(x)` on other types is not covered here: `Number(bool)` is
 * `b ? 1 : 0`, `Number(date)` is `date.getTime()`.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.parse(' 0x10 ');
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * assert.deepStrictEqual(okResult.value, 16);
 *
 * const errResult = SafeNumber.parse('12abc');
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'invalid-number',
 *   input: '12abc',
 * });
 * ```
 *
 * @param value The string to parse.
 * @returns `Ok<number>` with the parsed value (possibly `±Infinity`), or
 *   `Err<{ kind: 'invalid-number', input }>` when the input is blank or does
 *   not parse as a number.
 */
export const parse = (value: string): Result<number, ParseError> => {
  if (value.trim() === '') {
    return Result.err({ kind: 'invalid-number', input: value });
  }

  // ts-std-forge is the boundary implementer here (D-24): it wraps the raw
  // conversion itself rather than the prelude's finite-only `safeParseFloat`,
  // so that `'Infinity'` parses exactly as `Number` parses it.
  // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-float
  const parsed = Number(value);

  return Number.isNaN(parsed)
    ? Result.err({ kind: 'invalid-number', input: value })
    : Result.ok(parsed);
};

/** The failure type of {@link parse}. */
export type ParseError = Readonly<{ kind: 'invalid-number'; input: string }>;
