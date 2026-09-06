import { Result } from 'ts-data-forge';

/**
 * Parses a string as a base-10 integer — the alternative to calling
 * `Number(str)` / `Number.parseInt(str, 10)` for integers. (Named
 * `parseInteger` rather than `parseInt` because a declaration named after a
 * global shadows it — the very thing Tsubu forbids.)
 *
 * `Number.parseInt` ignores trailing non-numeric characters (`'123abc'` →
 * `123`) and `Number` coerces blank input to `0`. This function is the same
 * implementation as ts-data-forge's `Num.safeParseInt` (kept as a copy, not
 * a dependency, so that the two can be consolidated here later): the input
 * is accepted only when both `Number` and `Number.parseInt` agree it is a
 * finite number, and the `Number` result is truncated toward zero — which
 * rejects blank input and trailing garbage, and turns `'-12.9'` into `-12`.
 * (The finiteness check is the one addition over `Num.safeParseInt`, which
 * lets `'1e400'` through as `Infinity` typed as `Int`.)
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.parseInteger('-12.9');
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * assert.deepStrictEqual(okResult.value, -12);
 *
 * const errResult = SafeNumber.parseInteger('123abc');
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'invalid-integer',
 *   input: '123abc',
 * });
 * ```
 *
 * @param value The string to parse.
 * @returns `Ok<number>` with the parsed integer — a plain `number`, not
 *   ts-type-forge's `Int` brand, because ts-std-forge does not use branded
 *   number types (D-26 / D-39) — or
 *   `Err<{ kind: 'invalid-integer', input }>` when the input is blank, has
 *   trailing garbage, or is not a finite number.
 */
export const parseInteger = (
  value: string,
): Result<number, ParseIntegerError> => {
  // ts-std-forge is the boundary implementer (D-24): it wraps the raw
  // conversion itself rather than importing the prelude's `Num.safeParseInt`,
  // whose implementation this mirrors.
  // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-float
  const viaNumber = Number(value);

  // `Number('')` / `Number('   ')` は 0 を返すが、`parseInt` は NaN を返す。
  // 末尾不正文字 ('12abc' 等) は `Number` 側が NaN にするので、両者が共に
  // 有効な場合のみ採用することで空文字・空白のみ・末尾不正をまとめて弾く。
  // `Number('1e400')` は Infinity だが `parseInt('1e400', 10)` は 1 なので、
  // 両者の一致だけでは Infinity が整数として通ってしまう(Num.safeParseInt の
  // 穴)。有限性も要求する。
  return Number.isNaN(viaNumber) ||
    !Number.isFinite(viaNumber) ||
    // eslint-disable-next-line ts-data-forge/prefer-num-safe-parse-int
    Number.isNaN(Number.parseInt(value, 10))
    ? Result.err({ kind: 'invalid-integer', input: value })
    : Result.ok(Math.trunc(viaNumber));
};

/** The failure type of {@link parseInteger}. */
export type ParseIntegerError = Readonly<{
  kind: 'invalid-integer';
  input: string;
}>;
