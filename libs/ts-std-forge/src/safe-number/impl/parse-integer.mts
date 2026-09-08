import { Result } from '../../functional/index.mjs';

/**
 * Parses a string as a base-10 integer — the alternative to calling
 * `Number(str)` / `Number.parseInt(str, 10)` for integers. (Named
 * `parseInteger` rather than `parseInt` because a declaration named after a
 * global shadows it — the very thing Sumi forbids.)
 *
 * `Number.parseInt` ignores trailing non-numeric characters (`'123abc'` →
 * `123`) and `Number` coerces blank input to `0`. The input is accepted only
 * when both `Number` and `Number.parseInt` agree it is a finite number, and
 * the `Number` result is truncated toward zero — which rejects blank input
 * and trailing garbage, and turns `'-12.9'` into `-12`.
 *
 * This is the single implementation of the conversion: ts-data-forge's
 * `Num.safeParseInt` delegates here since D-49 (c) and only adds its own
 * contract on top (the `Int` brand on the success side, an `Error` on the
 * failure side). The finiteness check is what the old ts-data-forge
 * implementation lacked — it let `'1e400'` through as `Infinity` typed as
 * `Int`.
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
  // This is the implementation of the conversion, not a mirror of one:
  // ts-data-forge's `Num.safeParse*` delegates here since D-49 (c). The
  // raw `Number` call is what this function exists to wrap.
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
