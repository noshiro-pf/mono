import { isNumber, Num } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type PositiveInteger = number;

export const positiveInteger = <D extends PositiveInteger>(
  defaultValue: D
): Type<PositiveInteger, D> =>
  createPrimitiveType({
    is: (a: unknown): a is PositiveInteger =>
      isNumber(a) && Num.isInt(a) && a >= 0,
    defaultValue,
  });
