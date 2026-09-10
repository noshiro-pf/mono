// cspell:ignore Stringifiable
/**
 * Converts a primitive to its string form — the alternative to calling
 * `String(x)`.
 *
 * For `string` / `number` / `boolean` a template literal is the idiomatic
 * spelling, but TypeScript rejects `symbol` in a template literal (it throws
 * at runtime) and the lint configuration keeps `bigint` / `undefined` out of
 * them as well. This function names the intent — stringify a primitive —
 * and is total: `String` cannot throw for any of the accepted types.
 * Objects are deliberately excluded (their `toString` may throw or be
 * missing); use `unknownToString` from this package for `unknown`.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(
 *   SafeString.fromPrimitive(Symbol('tag')),
 *   'Symbol(tag)',
 * );
 *
 * assert.deepStrictEqual(SafeString.fromPrimitive(10n), '10');
 * ```
 *
 * @param value The primitive to stringify.
 * @returns The same string `String(value)` produces.
 */
export const fromPrimitive = (value: StringifiablePrimitive): string =>
  // The strict standard library marks `String(...)` deprecated to steer
  // callers here; this is the one call site that is meant to make it.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  String(value);

/** The primitives {@link fromPrimitive} accepts (every primitive but `null`). */
export type StringifiablePrimitive =
  string | number | boolean | bigint | symbol | undefined;
