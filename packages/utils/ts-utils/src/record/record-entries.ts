import { assertType, TypeEq } from '../types';

export const recordEntries = <K extends PropertyKey, V>(
  object: Record<K, V>
): [K, V][] => Object.entries(object) as [K, V][];

const keys = recordEntries({ x: 1, y: 2 });
assertType<TypeEq<typeof keys, ['x' | 'y', number][]>>();
