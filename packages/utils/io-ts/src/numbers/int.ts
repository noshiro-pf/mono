import { isNumber, Num } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

type Int = number;

export const int = (defaultValue: Int): Type<Int> =>
  createPrimitiveType({
    typeName: 'int',
    defaultValue,
    is: (a: unknown): a is Int => isNumber(a) && Num.isInt(a),
  });
