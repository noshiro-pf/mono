import { isPositiveInt } from 'ts-data-forge';
import { type PositiveInt } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import {
  type ConstrainedType,
  type NoConstraints,
} from '../../../constraints/index.mjs';
import {
  number,
  type NumberConstraintsOf,
  type NumberRangeConstraints,
} from '../../../primitives/index.mjs';

export function positiveInt(
  defaultValue?: number,
): ConstrainedType<PositiveInt, NumberConstraintsOf<NoConstraints>>;

export function positiveInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<PositiveInt, NumberConstraintsOf<C>>;

export function positiveInt(
  defaultValue: number = 1,
  constraints?: NumberRangeConstraints,
): ConstrainedType<PositiveInt, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
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
    brandFalseKeys: ['NaNValue', '<=0'],
    typeName: 'PositiveInt',
  });
}
