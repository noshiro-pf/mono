import { isNumber } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type NonNegativeNumber = number;

export const nonNegativeNumber = <D extends NonNegativeNumber>(
  defaultValue: D
): Type<NonNegativeNumber, D> =>
  createPrimitiveType({
    is: (a: unknown): a is NonNegativeNumber => isNumber(a) && a >= 0,
    defaultValue,
  });
