import { asInt, Int } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const int = (defaultValue: Int = asInt(0)): Type<Int> =>
  brand({
    codec: number(defaultValue),
    is: Int.is,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaNValue'],
  });
