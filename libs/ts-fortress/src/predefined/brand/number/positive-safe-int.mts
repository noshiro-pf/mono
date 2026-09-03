import { isPositiveSafeInt } from 'ts-data-forge';
import { type PositiveSafeInt } from 'ts-type-forge';
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

export function positiveSafeInt(
  defaultValue?: number,
): ConstrainedType<PositiveSafeInt, NumberConstraintsOf<NoConstraints>>;

export function positiveSafeInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<PositiveSafeInt, NumberConstraintsOf<C>>;

export function positiveSafeInt(
  defaultValue: number = 1,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  PositiveSafeInt,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isPositiveSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue', '<=0'],
    typeName: 'PositiveSafeInt',
  });
}
