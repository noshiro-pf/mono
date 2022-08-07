import { isNumber, Num } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

type Uint = number;

export const uint = (defaultValue: Uint): Type<Uint> =>
  createPrimitiveType({
    typeName: 'uint',
    defaultValue,
    is: (a: unknown): a is Uint => isNumber(a) && Num.isInt(a) && a >= 0,
  });
