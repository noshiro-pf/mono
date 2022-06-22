import { isNumber } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type NonNegativeNumber = number;

export const nonNegativeNumber = (
  defaultValue: NonNegativeNumber
): Type<NonNegativeNumber> =>
  createPrimitiveType({
    is: (a: unknown): a is NonNegativeNumber => isNumber(a) && a >= 0,
    defaultValue,
  });
