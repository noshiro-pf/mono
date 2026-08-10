import { SafeInt } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const safeInt = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<SafeInt> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: SafeInt.is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'SafeInt',
  });
