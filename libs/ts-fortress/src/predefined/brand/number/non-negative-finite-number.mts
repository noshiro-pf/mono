import { isNonNegativeFiniteNumber } from 'ts-data-forge';
import { type NonNegativeFiniteNumber } from 'ts-type-forge';
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

export function nonNegativeFiniteNumber(
  defaultValue?: number,
): ConstrainedType<NonNegativeFiniteNumber, NumberConstraintsOf<NoConstraints>>;

export function nonNegativeFiniteNumber<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonNegativeFiniteNumber, NumberConstraintsOf<C>>;

export function nonNegativeFiniteNumber(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NonNegativeFiniteNumber,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonNegativeFiniteNumber,
    defaultValue,
    brandKeys: ['>=0', '> -2^16', '> -2^32', '>= -2^15', '>= -2^31', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonNegativeFiniteNumber',
  });
}
