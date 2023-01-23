import { isNumber } from '@noshiro/ts-utils';
import { type Type } from '../type';
import { createPrimitiveType } from '../utils';

type NonNegativeNumber = number;

export const nonNegativeNumber = (
  defaultValue: NonNegativeNumber
): Type<NonNegativeNumber> =>
  createPrimitiveType({
    typeName: 'non negative number',
    defaultValue,
    is: (a: unknown): a is NonNegativeNumber => isNumber(a) && a >= 0,
  });
