import { isNumber } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type PositiveNumber = number;

export const positiveNumber = (
  defaultValue: PositiveNumber
): Type<PositiveNumber> =>
  createPrimitiveType({
    is: (a: unknown): a is PositiveNumber => isNumber(a) && a > 0,
    defaultValue,
  });
