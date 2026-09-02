import { isNegativeInt } from 'ts-data-forge';
import { type NegativeInt } from 'ts-type-forge';
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

export function negativeInt(
  defaultValue?: number,
): ConstrainedType<NegativeInt, NumberConstraintsOf<NoConstraints>>;

export function negativeInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<NegativeInt, NumberConstraintsOf<C>>;

export function negativeInt(
  defaultValue: number = -1,
  constraints?: NumberRangeConstraints,
): ConstrainedType<NegativeInt, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isNegativeInt,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '!=0',
      '< 2^15',
      '< 2^16',
      '< 2^31',
      '< 2^32',
      '<=0',
    ],
    brandFalseKeys: ['NaNValue', '>=0'],
    typeName: 'NegativeInt',
  });
}
