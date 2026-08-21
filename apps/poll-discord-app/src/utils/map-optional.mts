/**
 * Applies `fn` unless the value is absent.
 *
 * Ported from the `@noshiro/ts-utils` this app used before the monorepo
 * consolidation; `ts-data-forge` has no successor for it.
 */
export const mapOptional = <A, B>(
  value: A | null | undefined,
  fn: (v: A) => B,
): B | undefined => (value == null ? undefined : fn(value));
