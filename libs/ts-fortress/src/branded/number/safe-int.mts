import { asSafeInt, SafeInt } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const safeInt = (defaultValue: SafeInt = asSafeInt(0)): Type<SafeInt> =>
  brand({
    codec: number(defaultValue),
    is: SafeInt.is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt'],
    brandFalseKeys: ['NaNValue'],
  });
