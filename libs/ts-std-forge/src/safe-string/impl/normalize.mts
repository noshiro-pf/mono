/**
 * The Unicode normalization forms accepted by `String.prototype.normalize`.
 */
export type NormalizationForm = 'NFC' | 'NFD' | 'NFKC' | 'NFKD';

/**
 * Normalizes a string to a Unicode normalization form.
 *
 * `String.prototype.normalize` throws a `RangeError` only when `form` is not
 * one of `'NFC'`, `'NFD'`, `'NFKC'`, `'NFKD'`. With `form` typed as that
 * union the failure is unrepresentable at compile time, so the function is
 * total and returns the string directly — wrapping it in a `Result` would
 * force every caller to unwrap an error that cannot occur. A caller holding
 * a dynamic string must narrow it to {@link NormalizationForm} first; one
 * that defeats the type system gets the raw `RangeError`, by design.
 *
 * @example
 *
 * ```ts
 * // NFD decomposes U+00C5 into U+0041 + U+030A.
 * assert.deepStrictEqual(SafeString.normalize('\u{C5}', 'NFD'), 'A\u{30A}');
 * ```
 *
 * @param value The string to normalize.
 * @param form The normalization form. Defaults to `'NFC'`.
 * @returns The normalized string.
 */
export const normalize = (value: string, form?: NormalizationForm): string =>
  value.normalize(form);
