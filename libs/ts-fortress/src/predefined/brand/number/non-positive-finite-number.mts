import { isNonPositiveFiniteNumber } from 'ts-data-forge';
import { type NonPositiveFiniteNumber } from 'ts-type-forge';
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

export function nonPositiveFiniteNumber(
  defaultValue?: number,
): ConstrainedType<NonPositiveFiniteNumber, NumberConstraintsOf<NoConstraints>>;

export function nonPositiveFiniteNumber<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonPositiveFiniteNumber, NumberConstraintsOf<C>>;

export function nonPositiveFiniteNumber(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NonPositiveFiniteNumber,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonPositiveFiniteNumber,
    defaultValue,
    brandKeys: ['Finite', '< 2^15', '< 2^16', '< 2^31', '< 2^32', '<=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonPositiveFiniteNumber',
  });
}
