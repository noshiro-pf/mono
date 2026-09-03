import { isNonZeroSafeInt } from 'ts-data-forge';
import { type NonZeroSafeInt } from 'ts-type-forge';
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

export function nonZeroSafeInt(
  defaultValue: number,
): ConstrainedType<NonZeroSafeInt, NumberConstraintsOf<NoConstraints>>;

export function nonZeroSafeInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonZeroSafeInt, NumberConstraintsOf<C>>;

export function nonZeroSafeInt(
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NonZeroSafeInt,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonZeroSafeInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt', '!=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroSafeInt',
  });
}
