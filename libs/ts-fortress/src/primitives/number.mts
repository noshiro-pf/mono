import { Arr, isNumber } from 'ts-data-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export function number(defaultValue?: number): Type<number>;

export function number<N extends number, const C extends Constraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): Type<number>;

export function number<C extends Constraints>(
  defaultValue: number = 0,
  constraints?: C,
): Type<number> {
  const baseType = createPrimitiveType({
    typeName: 'number',
    defaultValue,
    is: isNumber,
  });

  if (
    constraints === undefined ||
    Arr.isArrayOfLength(Object.keys(constraints), 0)
  ) {
    return baseType;
  }

  if (constraints.gt !== undefined && !(defaultValue > constraints.gt)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint gt = ${constraints.gt}`,
    );
  }

  if (constraints.gte !== undefined && !(defaultValue >= constraints.gte)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint gte = ${constraints.gte}`,
    );
  }

  if (constraints.min !== undefined && !(defaultValue >= constraints.min)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint min = ${constraints.min}`,
    );
  }

  if (constraints.lt !== undefined && !(defaultValue < constraints.lt)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint lt = ${constraints.lt}`,
    );
  }

  if (constraints.lte !== undefined && !(defaultValue <= constraints.lte)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint lte = ${constraints.lte}`,
    );
  }

  if (constraints.max !== undefined && !(defaultValue <= constraints.max)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint max = ${constraints.max}`,
    );
  }

  if (constraints.positive === true && !(defaultValue > 0)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint positive = true`,
    );
  }

  if (constraints.nonNegative === true && !(defaultValue >= 0)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint nonNegative = true`,
    );
  }

  if (constraints.negative === true && !(defaultValue < 0)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint negative = true`,
    );
  }

  if (constraints.nonPositive === true && !(defaultValue <= 0)) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint nonPositive = true`,
    );
  }

  if (
    constraints.multipleOf !== undefined &&
    defaultValue % constraints.multipleOf !== 0
  ) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint multipleOf = ${constraints.multipleOf}`,
    );
  }

  if (constraints.step !== undefined && defaultValue % constraints.step !== 0) {
    throw new Error(
      `defaultValue ${defaultValue} for number does not satisfy the constraint step = ${constraints.step}`,
    );
  }

  const satisfiesConstraints = createConstraintsPredicate(constraints);

  return refine({
    baseType,
    defaultValue,
    is: (value): value is number => satisfiesConstraints(value),
    typeName: 'number',
  });
}

type Constraints = Partial<
  Readonly<{
    gt: number;
    gte: number;
    min: number;
    lt: number;
    lte: number;
    max: number;
    negative: boolean;
    nonNegative: boolean;
    positive: boolean;
    nonPositive: boolean;
    multipleOf: number;
    step: number;
  }>
>;

type DefaultValueType<
  N extends number,
  R extends Constraints,
> = DefaultValueWhenNegativeIsOn<N, R> &
  DefaultValueWhenNonNegativeIsOn<N, R> &
  DefaultValueWhenPositiveIsOn<N, R> &
  DefaultValueWhenNonPositiveIsOn<N, R>;

type DefaultValueWhenNegativeIsOn<N extends number, R extends Constraints> =
  R extends Readonly<{ negative: true }> ? NegativeNumber<N> : number;

type DefaultValueWhenNonNegativeIsOn<N extends number, R extends Constraints> =
  R extends Readonly<{ nonNegative: true }> ? NonNegativeNumber<N> : number;

type DefaultValueWhenPositiveIsOn<N extends number, R extends Constraints> =
  R extends Readonly<{ positive: true }> ? PositiveNumber<N> : number;

type DefaultValueWhenNonPositiveIsOn<N extends number, R extends Constraints> =
  R extends Readonly<{ nonPositive: true }> ? NonPositiveNumber<N> : number;

type NegativeNumber<N extends number> = number extends N
  ? number
  : IsNegative<N> extends true
    ? N
    : never;

type NonNegativeNumber<N extends number> = number extends N
  ? number
  : IsNonNegative<N> extends true
    ? N
    : never;

type PositiveNumber<N extends number> = number extends N
  ? number
  : IsPositive<N> extends true
    ? N
    : never;

type NonPositiveNumber<N extends number> = number extends N
  ? number
  : IsNonPositive<N> extends true
    ? N
    : never;

type IsNegative<N extends number> = `${N}` extends `-${string}` ? true : false;

type IsNonNegative<N extends number> =
  IsNegative<N> extends true ? false : true;

type IsPositive<N extends number> = N extends 0 ? false : IsNonNegative<N>;

type IsNonPositive<N extends number> =
  IsPositive<N> extends true ? false : true;

const createConstraintsPredicate =
  (constraints: Constraints) =>
  (value: number): boolean => {
    if (constraints.gt !== undefined && !(value > constraints.gt)) {
      return false;
    }

    if (constraints.gte !== undefined && !(value >= constraints.gte)) {
      return false;
    }

    if (constraints.min !== undefined && !(value >= constraints.min)) {
      return false;
    }

    if (constraints.lt !== undefined && !(value < constraints.lt)) {
      return false;
    }

    if (constraints.lte !== undefined && !(value <= constraints.lte)) {
      return false;
    }

    if (constraints.max !== undefined && !(value <= constraints.max)) {
      return false;
    }

    if (constraints.positive === true && !(value > 0)) {
      return false;
    }

    if (constraints.nonNegative === true && !(value >= 0)) {
      return false;
    }

    if (constraints.negative === true && !(value < 0)) {
      return false;
    }

    if (constraints.nonPositive === true && !(value <= 0)) {
      return false;
    }

    if (
      constraints.multipleOf !== undefined &&
      value % constraints.multipleOf !== 0
    ) {
      return false;
    }

    if (constraints.step !== undefined && value % constraints.step !== 0) {
      return false;
    }

    return true;
  };
