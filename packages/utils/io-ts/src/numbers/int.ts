import { isNumber, Num } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type Int = number;

export const int = (defaultValue: Int): Type<Int> =>
  createPrimitiveType({
    is: (a: unknown): a is Int => isNumber(a) && Num.isInt(a),
    defaultValue,
  });
