/**
 * Type guard that checks if a value is a non-empty string.
 *
 * This function performs both a type check (ensuring the value is a string) and
 * a length check (ensuring the string is not empty). It acts as a type guard
 * that narrows the input type to exclude `null`, `undefined`, and empty
 * strings.
 *
 * **Type Narrowing Behavior:**
 *
 * - Eliminates `null` and `undefined` from the type
 * - Excludes empty string (`""`) from the type
 * - Preserves literal string types when possible
 * - Whitespace-only strings are considered non-empty
 *
 * @example
 *
 * ```ts
 * const words: readonly (string | undefined)[] = [
 *   'Ada',
 *   undefined,
 *   '',
 *   'Lovelace',
 * ] as const;
 *
 * const nonEmpty = words.filter(isNonEmptyString);
 *
 * assert.deepStrictEqual(nonEmpty, ['Ada', 'Lovelace']);
 * ```
 *
 * @template S - The input type, which can include `string`, `null`, or
 *   `undefined`
 * @param s - The value to check
 * @returns `true` if `s` is a string with length > 0, `false` otherwise. When
 *   `true`, TypeScript narrows the type to exclude empty strings and nullish
 *   values.
 */
export const isNonEmptyString = <S extends string | null | undefined>(
  s: S,
): s is RelaxedExclude<NonNullable<S>, ''> =>
  typeof s === 'string' && s.length > 0;
