import { FiniteNumber } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const finiteNumber = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<FiniteNumber> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: FiniteNumber.is,
    defaultValue,
    brandKeys: ['Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'FiniteNumber',
  });
