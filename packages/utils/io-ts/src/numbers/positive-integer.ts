import { isNumber, Num } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createPrimitiveType } from '../utils';

type PositiveInteger = number;

export const positiveInteger = (
  defaultValue: PositiveInteger
): Type<PositiveInteger> =>
  createPrimitiveType({
    typeName: 'positive integer',
    defaultValue,
    is: (a: unknown): a is PositiveInteger =>
      isNumber(a) && Num.isInt(a) && a >= 0,
  });
