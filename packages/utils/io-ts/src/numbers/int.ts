import { isNumber, Num } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type Int = number;

export const int = <D extends Int>(defaultValue: D): Type<Int, D> =>
  createPrimitiveType({
    is: (a: unknown): a is Int => isNumber(a) && Num.isInt(a),
    defaultValue,
  });
