import { Result } from '../../functional/index.mjs';

/**
 * Parses a string as an integer: the number `Number(str)` reads from it,
 * truncated toward zero — the alternative to calling `Number(str)` /
 * `Number.parseInt(str, 10)` for integers. (Named `parseInteger` rather than
 * `parseInt` because a declaration named after a global shadows it — the very
 * thing Sumi forbids.)
 *
 * What is accepted is exactly what `Number` reads as a finite number: decimal
 * with an optional sign, fraction and exponent (`'-12.9'` → `-12`, `'.5'` →
 * `0`, `'1e3'` → `1000`), and the unsigned hexadecimal, binary and octal
 * literals (`'0x1F'` → `31`, `'0b11'` → `3`, `'0o17'` → `15`), with surrounding
 * whitespace. A signed one (`'-0x10'`) is `NaN` to `Number`, so it fails here
 * too. The input fails when it is blank, has trailing garbage (`'123abc'`,
 * which `Number.parseInt` would read as `123`) or is not finite (`'1e400'`).
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
 * assert.strictEqual(okResult.value, -12);
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
 *   `Err<{ kind: 'invalid-integer', input }>` when `Number` reads no finite
 *   number from it, or it is blank.
 */
export const parseInteger = (
  value: string,
): Result<number, ParseIntegerError> => {
  // This is the implementation of the conversion, not a mirror of one:
  // ts-data-forge's `Num.safeParse*` delegates here since D-49 (c). The
  // raw `Number` call is what this function exists to wrap.
  const viaNumber = Number(value);

  // `Number('')` / `Number('   ')` は 0 を返すので、空白だけの入力は先に弾く
  // （`trim` が除く空白は `Number` が無視する空白と同じ）。末尾不正文字
  // （'12abc' 等）は `Number` が NaN にし、`Number('1e400')` は Infinity なので
  // 有限性も要求する。以前は `parseInt` との一致で空白を弾いていたが、それは
  // `parseInt('.5', 10)` が NaN であるため '.5' まで弾いていた（#2952）。
  return value.trim() === '' || !Number.isFinite(viaNumber)
    ? Result.err({ kind: 'invalid-integer', input: value })
    : Result.ok(Math.trunc(viaNumber));
};

/** The failure type of {@link parseInteger}. */
export type ParseIntegerError = Readonly<{
  kind: 'invalid-integer';
  input: string;
}>;
