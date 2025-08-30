import { asPositiveInt, isPositiveInt } from 'ts-data-forge';
import { number } from '../../primitives/index.mjs';
import { type Type } from '../../type.mjs';
import { brand } from '../brand.mjs';

export const positiveInt = (
  defaultValue: PositiveInt = asPositiveInt(1),
): Type<PositiveInt> =>
  brand({
    baseType: number(defaultValue),
    is: isPositiveInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'PositiveInt',
  });
