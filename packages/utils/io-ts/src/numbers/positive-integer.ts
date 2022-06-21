import { isNumber, Num } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type PositiveInteger = number;

export const positiveInteger = (
  defaultValue: PositiveInteger
): Type<PositiveInteger> =>
  createPrimitiveType({
    is: (a: unknown): a is PositiveInteger =>
      isNumber(a) && Num.isInt(a) && a >= 0,
    defaultValue,
  });
