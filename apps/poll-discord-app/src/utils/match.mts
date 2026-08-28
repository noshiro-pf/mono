import { hasKey } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

/**
 * Looks a value up in a table of cases.
 *
 * Ported from the `@noshiro/ts-utils` this app used before the monorepo
 * consolidation; `ts-data-forge` has no successor for it.
 *
 * When the target is a literal union the result is `V`, because the table has
 * to cover it. When it is a wider type — `string`, say — the lookup can miss,
 * so the result includes `undefined`.
 */
export function match<const Case extends PropertyKey, const V>(
  target: Case,
  cases: ReadonlyRecord<Case, V>,
): IsLiteralKey<Case> extends true ? V : V | undefined;

export function match<const V>(
  target: PropertyKey,
  cases: Partial<ReadonlyRecord<PropertyKey, V>>,
): V | undefined {
  return hasKey(cases, target) ? cases[target] : undefined;
}

/** Whether `T` is a literal rather than one of the wide key types. */
type IsLiteralKey<T extends PropertyKey> = string extends T
  ? false
  : number extends T
    ? false
    : symbol extends T
      ? false
      : true;
