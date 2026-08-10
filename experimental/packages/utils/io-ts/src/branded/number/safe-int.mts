import { toSafeInt } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const safeInt = (defaultValue: SafeInt = toSafeInt(0)): Type<SafeInt> =>
  brand({
    codec: number(defaultValue),
    is: Number.isSafeInteger,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt'],
    brandFalseKeys: ['NaNValue'],
  });
