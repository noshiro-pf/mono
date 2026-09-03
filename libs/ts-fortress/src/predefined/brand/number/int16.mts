import { isInt16 } from 'ts-data-forge';
import { type Int16 } from 'ts-type-forge';
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

export function int16(
  defaultValue?: number,
): ConstrainedType<Int16, NumberConstraintsOf<NoConstraints>>;

export function int16<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<Int16, NumberConstraintsOf<C>>;

export function int16(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<Int16, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isInt16,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '< 2^32',
      '< 2^31',
      '< 2^15',
      '< 2^16',
      '> -2^16',
      '>= -2^15',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Int16',
  });
}
