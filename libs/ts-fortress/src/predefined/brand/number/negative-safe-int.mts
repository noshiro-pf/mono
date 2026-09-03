import { isNegativeSafeInt } from 'ts-data-forge';
import { type NegativeSafeInt } from 'ts-type-forge';
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

export function negativeSafeInt(
  defaultValue?: number,
): ConstrainedType<NegativeSafeInt, NumberConstraintsOf<NoConstraints>>;

export function negativeSafeInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NegativeSafeInt, NumberConstraintsOf<C>>;

export function negativeSafeInt(
  defaultValue: number = -1,
  constraints?: NumberRangeConstraints,
): ConstrainedType<
  NegativeSafeInt,
  NumberConstraintsOf<NumberRangeConstraints>
> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNegativeSafeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '!=0',
      '< 2^15',
      '< 2^16',
      '< 2^31',
      '< 2^32',
      '<=0',
    ],
    brandFalseKeys: ['NaNValue', '>=0'],
    typeName: 'NegativeSafeInt',
  });
}
