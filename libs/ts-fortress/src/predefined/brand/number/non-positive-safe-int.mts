import { isNonPositiveSafeInt } from 'ts-data-forge';
import { type NonPositiveSafeInt } from 'ts-type-forge';
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

export function nonPositiveSafeInt(
  defaultValue?: number,
): ConstrainedType<NonPositiveSafeInt, NumberConstraintsOf<NoConstraints>>;

export function nonPositiveSafeInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonPositiveSafeInt, NumberConstraintsOf<C>>;

export function nonPositiveSafeInt(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NonPositiveSafeInt,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonPositiveSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '< 2^15',
      '< 2^16',
      '< 2^31',
      '< 2^32',
      '<=0',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonPositiveSafeInt',
  });
}
