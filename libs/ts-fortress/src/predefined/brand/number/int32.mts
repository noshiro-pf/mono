import { isInt32 } from 'ts-data-forge';
import { type Int32 } from 'ts-type-forge';
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

export function int32(
  defaultValue?: number,
): ConstrainedType<Int32, NumberConstraintsOf<NoConstraints>>;

export function int32<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<Int32, NumberConstraintsOf<C>>;

export function int32(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<Int32, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isInt32,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '< 2^32',
      '< 2^31',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Int32',
  });
}
