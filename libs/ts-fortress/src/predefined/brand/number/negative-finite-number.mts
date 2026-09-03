import { isNegativeFiniteNumber } from 'ts-data-forge';
import { type NegativeFiniteNumber } from 'ts-type-forge';
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

export function negativeFiniteNumber(
  defaultValue: number,
): ConstrainedType<NegativeFiniteNumber, NumberConstraintsOf<NoConstraints>>;

export function negativeFiniteNumber<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NegativeFiniteNumber, NumberConstraintsOf<C>>;

export function negativeFiniteNumber(
  defaultValue: number,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NegativeFiniteNumber,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNegativeFiniteNumber,
    defaultValue,
    brandKeys: ['Finite', '!=0', '< 2^15', '< 2^16', '< 2^31', '< 2^32', '<=0'],
    brandFalseKeys: ['NaNValue', '>=0'],
    typeName: 'NegativeFiniteNumber',
  });
}
