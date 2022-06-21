import { isNumber, Num } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type Uint = number;

export const uint = (defaultValue: Uint): Type<Uint> =>
  createPrimitiveType({
    is: (a: unknown): a is Uint => isNumber(a) && Num.isInt(a) && a >= 0,
    defaultValue,
  });
