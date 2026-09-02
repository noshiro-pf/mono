import { FiniteNumber } from 'ts-data-forge';
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

export function finiteNumber(
  defaultValue?: number,
): ConstrainedType<FiniteNumber, NumberConstraintsOf<NoConstraints>>;

export function finiteNumber<const C extends NumberRangeConstraints>(
  defaultValue: number,
  constraints: C,
): ConstrainedType<FiniteNumber, NumberConstraintsOf<C>>;

export function finiteNumber(
  defaultValue: number = 0,
  constraints?: NumberRangeConstraints,
): ConstrainedType<FiniteNumber, NumberConstraintsOf<NumberRangeConstraints>> {
  return brand({
    baseType: number(defaultValue, constraints ?? {}),
    is: FiniteNumber.is,
    defaultValue,
    brandKeys: ['Finite'],
    brandFalseKeys: ['NaNValue'],
    typeName: 'FiniteNumber',
  });
}
