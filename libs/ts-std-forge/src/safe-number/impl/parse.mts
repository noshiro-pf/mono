import { Result } from '../../functional/index.mjs';

/**
 * Parses a string as a finite number — the alternative to calling
 * `Number(str)`.
 *
 * `Number(str)` never throws; it reports failure as `NaN`, turns the empty
 * (or whitespace-only) string into `0`, and accepts `'Infinity'`. This
 * function is the same implementation as ts-data-forge's
 * `Num.safeParseFloat` (kept as a copy, not a dependency, so that the two
 * can be consolidated here later): the input is accepted only when both
 * `Number` and `Number.parseFloat` agree it is a number **and** the result
 * is finite — which rejects blank input, trailing garbage (`'12px'`),
 * `'NaN'` and `'Infinity'` together.
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
 * const errResult = SafeNumber.parse('12px');
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'invalid-number',
 *   input: '12px',
 * });
 * ```
 *
 * @param value The string to parse.
 * @returns `Ok<number>` with the parsed (finite) value — a plain `number`,
 *   not ts-type-forge's `FiniteNumber` brand, because ts-std-forge does not
 *   use branded number types (D-26 / D-39) — or
 *   `Err<{ kind: 'invalid-number', input }>` when the input is blank, has
 *   trailing garbage, or is not finite.
 */
export const parse = (value: string): Result<number, ParseError> => {
  // This is the implementation of the conversion, not a mirror of one:
  // ts-data-forge's `Num.safeParse*` delegates here since D-49 (c). The
  // raw `Number` call is what this function exists to wrap.
  // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-float
  const viaNumber = Number(value);

  // `Number('')` / `Number('   ')` は 0 を返すが、`parseFloat` は NaN を返す。
  // 末尾不正文字 ('12abc' 等) は `Number` 側が NaN にするので、両者が共に
  // 非 NaN かつ有限の場合のみ採用することで空文字・空白のみ・末尾不正・
  // Infinity をまとめて弾く。
  return Number.isNaN(viaNumber) ||
    !Number.isFinite(viaNumber) ||
    // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-float
    Number.isNaN(Number.parseFloat(value))
    ? Result.err({ kind: 'invalid-number', input: value })
    : Result.ok(viaNumber);
};

/** The failure type of {@link parse}. */
export type ParseError = Readonly<{ kind: 'invalid-number'; input: string }>;
