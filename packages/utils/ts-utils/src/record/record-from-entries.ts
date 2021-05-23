import type { TypeEq } from '../types';
import { assertType } from '../types';

export const recordFromEntries = <K extends PropertyKey, T>(
  // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
  entries: Iterable<readonly [K, T]>
): Record<K, T> => Object.fromEntries(entries) as Record<K, T>;

const entryList = recordFromEntries([
  ['x', 1],
  ['y', 2],
] as const);
assertType<TypeEq<typeof entryList, Record<'x' | 'y', 1 | 2>>>();
