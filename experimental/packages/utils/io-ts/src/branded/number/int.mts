import { toInt } from '@noshiro/ts-utils';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const int = (defaultValue: Int = toInt(0)): Type<Int> =>
  brand({
    codec: number(defaultValue),
    is: Number.isInteger,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaNValue'],
  });
