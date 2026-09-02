import { Int } from 'ts-data-forge';
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

export function int(
  defaultValue?: number,
): ConstrainedType<Int, NumberConstraintsOf<NoConstraints>>;

export function int<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<Int, NumberConstraintsOf<C>>;

export function int(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<Int, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: Int.is,
    defaultValue,
    brandKeys: ['Finite', 'Int'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'Int',
  });
}
