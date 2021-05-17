import type { TypeEq } from '../types';
import { assertType } from '../types';

export const recordKeys = <R extends Record<PropertyKey, unknown>>(
  object: R
): (keyof R)[] => Object.keys(object);

const keys = recordKeys({ x: 1, y: 2 });
assertType<TypeEq<typeof keys, ('x' | 'y')[]>>();

const keys2 = recordKeys({ x: 1, y: 2, z: '3' });
assertType<TypeEq<typeof keys2, ('x' | 'y' | 'z')[]>>();
