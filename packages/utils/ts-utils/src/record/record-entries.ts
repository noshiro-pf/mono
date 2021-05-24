import type { ReadonlyRecord, TypeEq } from '../types';
import { assertType } from '../types';

export const recordEntries = <K extends PropertyKey, V>(
  object: ReadonlyRecord<K, V>
): [K, V][] => Object.entries(object) as [K, V][];

const keys = recordEntries({ x: 1, y: 2 } as const);
assertType<TypeEq<typeof keys, ['x' | 'y', 1 | 2][]>>();
