import { isSafeUint } from 'ts-data-forge';
import { type SafeUint } from 'ts-type-forge';
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

export function safeUint(
  defaultValue?: number,
): ConstrainedType<SafeUint, NumberConstraintsOf<NoConstraints>>;

export function safeUint<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<SafeUint, NumberConstraintsOf<C>>;

export function safeUint(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<SafeUint, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: isSafeUint,
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
    ],
    brandFalseKeys: ['NaNValue'],
    typeName: 'SafeUint',
  });
}
