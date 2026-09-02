import { isNonZeroInt } from 'ts-data-forge';
import { type NonZeroInt } from 'ts-type-forge';
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

export function nonZeroInt(
  defaultValue: number,
): ConstrainedType<NonZeroInt, NumberConstraintsOf<NoConstraints>>;

export function nonZeroInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonZeroInt, NumberConstraintsOf<C>>;

export function nonZeroInt(
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): ConstrainedType<NonZeroInt, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonZeroInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', '!=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroInt',
  });
}
