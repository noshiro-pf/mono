import { isUint16 } from 'ts-data-forge';
import { type Uint16 } from 'ts-type-forge';
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

export function uint16(
  defaultValue?: number,
): ConstrainedType<Uint16, NumberConstraintsOf<NoConstraints>>;

export function uint16<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<Uint16, NumberConstraintsOf<C>>;

export function uint16(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<Uint16, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isUint16,
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
      '< 2^16',
      '< 2^31',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Uint16',
  });
}
