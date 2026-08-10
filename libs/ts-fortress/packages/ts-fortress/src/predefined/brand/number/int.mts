import { Int } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import {
  number,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const int = (
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): Type<Int> =>
  brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: Int.is,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Int',
  });
