import type { TypeEq } from '../types';
import { assertType } from '../types';

export const recordFromEntries = <K extends PropertyKey, V>(
  entries: Iterable<readonly [K, V]>
): Record<K, V> => Object.fromEntries(entries) as Record<K, V>;

{
  const entries: readonly (readonly ['x' | 'y' | 'z' | 4, 1 | 2 | 3])[] = [
    ['x', 1],
    ['y', 2],
    ['z', 3],
    [4, 3],
  ] as const;
  const entryList = recordFromEntries(entries);

  assertType<
    TypeEq<typeof entryList, Record<'x' | 'y' | 'z' | 4, 1 | 2 | 3>>
  >();
}
