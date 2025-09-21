import { Int } from 'ts-data-forge';
import { brand } from '../../../brand/index.mjs';
import { number } from '../../../primitives/index.mjs';
import { type Type } from '../../../type.mjs';

export const int = (defaultValue: number = 0): Type<Int> =>
  brand({
    baseType: number(defaultValue),
    is: Int.is,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Int',
  });
