import { assertType, TypeEq } from '../types';

export const recordFromEntries = <K extends PropertyKey, T>(
  entries: Iterable<readonly [K, T]>
): Record<K, T> => Object.fromEntries(entries) as Record<K, T>;

const entries = recordFromEntries([
  ['x', 1],
  ['y', 2],
]);
assertType<TypeEq<typeof entries, Record<'x' | 'y', number>>>();
