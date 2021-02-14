import { assertType, TypeEq } from '../types';

export const recordValues = <K extends PropertyKey, V>(
  object: Record<K, V>
): V[] => Object.values(object);

const keys = recordValues({ x: 1, y: 2 });
assertType<TypeEq<typeof keys, number[]>>();
