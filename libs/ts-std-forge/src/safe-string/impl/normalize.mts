import { Result } from 'ts-data-forge';

/**
 * The Unicode normalization forms accepted by
 * `String.prototype.normalize`.
 */
export type NormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

/**
 * Normalizes a string to a Unicode normalization form without throwing.
 *
 * `String.prototype.normalize` throws a `RangeError` when `form` is not one
 * of `'NFC'`, `'NFD'`, `'NFKC'`, `'NFKD'`. The `form` parameter is
 * deliberately typed as that union rather than `string`: the only failure
 * mode is an invalid form, so the union makes the error unrepresentable at
 * compile time, and a caller holding a dynamic string should narrow it to
 * `NormalizationForm` first (making the validation explicit) rather than
 * have this wrapper accept arbitrary strings. The `Result` return type is
 * kept for API consistency and as a runtime safety net for callers that
 * bypass the type system.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeString.normalize('Å', 'NFD');
 *
 * assert.isTrue(Result.isOk(okResult));
 * ```
 *
 * @param value The string to normalize.
 * @param form The normalization form. Defaults to `'NFC'`.
 * @returns `Ok<string>` with the normalized string, `Err<Error>` if `form`
 *   is invalid at runtime.
 */
export const normalize = (
  value: string,
  form?: NormalizationForm,
): Result<string, Error> => Result.fromThrowable(() => value.normalize(form));
