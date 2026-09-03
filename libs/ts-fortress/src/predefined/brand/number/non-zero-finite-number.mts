import { isNonZeroFiniteNumber } from 'ts-data-forge';
import { type NonZeroFiniteNumber } from 'ts-type-forge';
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

export function nonZeroFiniteNumber(
  defaultValue: number,
): ConstrainedType<NonZeroFiniteNumber, NumberConstraintsOf<NoConstraints>>;

export function nonZeroFiniteNumber<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonZeroFiniteNumber, NumberConstraintsOf<C>>;

export function nonZeroFiniteNumber(
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NonZeroFiniteNumber,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonZeroFiniteNumber,
    defaultValue,
    brandKeys: ['!=0', 'Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonZeroFiniteNumber',
  });
}
