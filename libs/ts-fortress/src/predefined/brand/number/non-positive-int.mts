import { isNonPositiveInt } from 'ts-data-forge';
import { type NonPositiveInt } from 'ts-type-forge';
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

export function nonPositiveInt(
  defaultValue?: number,
): ConstrainedType<NonPositiveInt, NumberConstraintsOf<NoConstraints>>;

export function nonPositiveInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NonPositiveInt, NumberConstraintsOf<C>>;

export function nonPositiveInt(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NonPositiveInt,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNonPositiveInt,
    defaultValue,
    brandKeys: ['Finite', 'Int', '< 2^15', '< 2^16', '< 2^31', '< 2^32', '<=0'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'NonPositiveInt',
  });
}
