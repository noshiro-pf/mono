import type { TypeEq } from '../types';
import { assertType } from '../types';
import type { GeneralRecord } from './general-record';
import type { ToObjectKeysValue } from './to-object-keys';

export const recordKeys = <R extends GeneralRecord>(
  object: R
): ToObjectKeysValue<keyof R>[] =>
  Object.keys(object) as ToObjectKeysValue<keyof R>[];

const keys = recordKeys({ x: 1, y: 2 });
assertType<TypeEq<typeof keys, ('x' | 'y')[]>>();

const symb = Symbol();
const keys2 = recordKeys({ x: 1, y: 2, z: '3', 3: 4, [symb]: 5 });
assertType<TypeEq<typeof keys2, ('3' | 'x' | 'y' | 'z')[]>>();
