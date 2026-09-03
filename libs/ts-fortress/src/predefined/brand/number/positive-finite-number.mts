import { isPositiveFiniteNumber } from 'ts-data-forge';
import { type PositiveFiniteNumber } from 'ts-type-forge';
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

export function positiveFiniteNumber(
  defaultValue: number,
): ConstrainedType<PositiveFiniteNumber, NumberConstraintsOf<NoConstraints>>;

export function positiveFiniteNumber<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<PositiveFiniteNumber, NumberConstraintsOf<C>>;

export function positiveFiniteNumber(
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  PositiveFiniteNumber,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isPositiveFiniteNumber,
    defaultValue,
    brandKeys: [
      '>=0',
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      'Finite',
      '!=0',
    ],
    brandFalseKeys: ['NaNValue', '<=0'],
    typeName: 'PositiveFiniteNumber',
  });
}
