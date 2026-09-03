import { SafeInt } from 'ts-data-forge';
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

export function safeInt(
  defaultValue?: number,
): ConstrainedType<SafeInt, NumberConstraintsOf<NoConstraints>>;

export function safeInt<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<SafeInt, NumberConstraintsOf<C>>;

export function safeInt(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<SafeInt, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: SafeInt.is,
    defaultValue,
    brandKeys: ['Finite', 'Int', 'SafeInt'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'SafeInt',
  });
}
