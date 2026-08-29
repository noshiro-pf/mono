import { hasKey } from 'ts-data-forge';
import { type ReadonlyRecord, type UnknownRecord } from 'ts-type-forge';

/**
 * Whether `record` has `key`, and its value satisfies `guard`.
 *
 * Ported from the `Obj.hasKeyValue` of the `@noshiro/ts-utils` this package
 * used before the monorepo consolidation; `ts-data-forge` has `hasKey` but no
 * successor for this. The type guards throughout this package are written in
 * terms of it.
 *
 * The implementation signature widens the record to an index signature, so that
 * the value can be read as `unknown` without an assertion.
 */
export function hasKeyValue<
  const R extends UnknownRecord,
  const K extends PropertyKey,
  V,
>(
  record: R,
  key: K,
  guard: (value: unknown) => value is V,
): record is R & ReadonlyRecord<K, V>;

export function hasKeyValue<const K extends PropertyKey, V>(
  record: ReadonlyRecord<PropertyKey, unknown>,
  key: K,
  guard: (value: unknown) => value is V,
): boolean {
  return hasKey(record, key) && guard(record[key]);
}
