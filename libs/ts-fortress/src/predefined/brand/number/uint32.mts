import { isUint32 } from 'ts-data-forge';
import { type Uint32 } from 'ts-type-forge';
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

export function uint32(
  defaultValue?: number,
): ConstrainedType<Uint32, NumberConstraintsOf<NoConstraints>>;

export function uint32<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<Uint32, NumberConstraintsOf<C>>;

export function uint32(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<Uint32, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isUint32,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      'SafeInt',
      '> -2^16',
      '> -2^32',
      '>= -2^15',
      '>= -2^31',
      '>=0',
      '< 2^32',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Uint32',
  });
}
