import type { ReadonlyRecord, TypeEq } from '../types';
import { assertType } from '../types';

export const recordValues = <K extends PropertyKey, V>(
  object: ReadonlyRecord<K, V>
): V[] => Object.values(object);

const keys = recordValues({ x: 1, y: 2 } as const);
assertType<TypeEq<typeof keys, (1 | 2)[]>>();
