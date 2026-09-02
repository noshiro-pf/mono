import { isUint } from 'ts-data-forge';
import { type Uint } from 'ts-type-forge';
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

export function uint(
  defaultValue?: number,
): ConstrainedType<Uint, NumberConstraintsOf<NoConstraints>>;

export function uint<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<Uint, NumberConstraintsOf<C>>;

export function uint(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<Uint, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isUint,
    defaultValue,
    brandKeys: [
      'Finite',
      'Int',
      '> -2^32',
      '>= -2^31',
      '> -2^16',
      '>= -2^15',
      '>=0',
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Uint',
  });
}
