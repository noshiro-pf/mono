import type { TypeEq } from '../types';
import { assertType } from '../types';

export const recordFromEntries = <K extends PropertyKey, T>(
  entries: Iterable<readonly [K, T]>
): Record<K, T> => Object.fromEntries(entries) as Record<K, T>;

const entryList = recordFromEntries([
  ['x', 1],
  ['y', 2],
]);
assertType<TypeEq<typeof entryList, Record<'x' | 'y', number>>>();
