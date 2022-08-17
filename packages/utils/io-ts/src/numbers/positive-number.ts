import { isNumber } from '@noshiro/ts-utils';
import type { Type } from '../type';
import { createPrimitiveType } from '../utils';

type PositiveNumber = number;

export const positiveNumber = (
  defaultValue: PositiveNumber
): Type<PositiveNumber> =>
  createPrimitiveType({
    typeName: 'positive number',
    defaultValue,
    is: (a: unknown): a is PositiveNumber => isNumber(a) && a > 0,
  });
