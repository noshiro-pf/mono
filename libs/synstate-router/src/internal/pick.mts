import type { ReadonlyRecord } from 'ts-type-forge';

/** The entries of `record` named by `keys`, in their order. */
export const pick = (
  record: ReadonlyRecord<string, unknown>,
  keys: readonly string[],
): ReadonlyRecord<string, unknown> =>
  Object.fromEntries(keys.map((key) => [key, record[key]]));
