import { isNumber } from '@noshiro/ts-utils';
import { createPrimitiveType } from '../primitives';
import type { Type } from '../type';

type PositiveNumber = number;

export const positiveNumber = <D extends PositiveNumber>(
  defaultValue: D
): Type<PositiveNumber, D> =>
  createPrimitiveType({
    is: (a: unknown): a is PositiveNumber => isNumber(a) && a > 0,
    defaultValue,
  });
