/* eslint-disable unicorn/no-negated-comparison */
import { Arr, expectType, isBigint, Result } from 'ts-data-forge';
import { type BoolAnd, type BoolNot } from 'ts-type-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

type NumberType = bigint;

export function bigint(defaultValue?: NumberType): Type<NumberType>;

export function bigint<N extends NumberType, const C extends Constraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): Type<NumberType>;

export function bigint<C extends Constraints>(
  defaultValue: NumberType = 0n,
  constraints?: C,
): Type<NumberType> {
  const baseType = createPrimitiveType({
    typeName: 'bigint',
    defaultValue,
    is: isBigint,
  });

  if (
    constraints === undefined ||
    Arr.isFixedLengthTuple(Object.keys(constraints), 0)
  ) {
    return baseType;
  }

  const constraintsPredicate = createConstraintsPredicate(constraints);

  const defaultValueConstraintsCheck = constraintsPredicate(defaultValue);

  if (Result.isErr(defaultValueConstraintsCheck)) {
    throw new Error(defaultValueConstraintsCheck.value);
  }

  return refine({
    baseType,
    defaultValue,
    is: (value): value is NumberType =>
      Result.isOk(constraintsPredicate(value)),
    typeName: 'bigint',
  });
}

type Constraints = Partial<
  Readonly<{
    nonZero: true;
    negative: true;
    nonNegative: true;
    positive: true;
    nonPositive: true;

    gt: NumberType;
    gte: NumberType;
    min: NumberType;
    lt: NumberType;
    lte: NumberType;
    max: NumberType;
    multipleOf: NumberType;
    step: NumberType;
  }>
>;

type DefaultValueType<
  N extends NumberType,
  C extends Constraints,
> = DefaultValueWhenNonZeroIsOn<N, C> &
  DefaultValueWhenNegativeIsOn<N, C> &
  DefaultValueWhenNonNegativeIsOn<N, C> &
  DefaultValueWhenPositiveIsOn<N, C> &
  DefaultValueWhenNonPositiveIsOn<N, C>;

type DefaultValueWhenNonZeroIsOn<N extends NumberType, C extends Constraints> =
  C extends Readonly<{ nonZero: true }> ? NonZeroNumber<N> : NumberType;

type DefaultValueWhenNegativeIsOn<N extends NumberType, C extends Constraints> =
  C extends Readonly<{ negative: true }> ? NegativeNumber<N> : NumberType;

type DefaultValueWhenNonNegativeIsOn<
  N extends NumberType,
  C extends Constraints,
> =
  C extends Readonly<{ nonNegative: true }> ? NonNegativeNumber<N> : NumberType;

type DefaultValueWhenPositiveIsOn<N extends NumberType, C extends Constraints> =
  C extends Readonly<{ positive: true }> ? PositiveNumber<N> : NumberType;

type DefaultValueWhenNonPositiveIsOn<
  N extends NumberType,
  C extends Constraints,
> =
  C extends Readonly<{ nonPositive: true }> ? NonPositiveNumber<N> : NumberType;

type NonZeroNumber<N extends NumberType> = NumberType extends N
  ? NumberType
  : IsZero<N> extends true
    ? never
    : N;

type NegativeNumber<N extends NumberType> = NumberType extends N
  ? NumberType
  : IsNegative<N> extends true
    ? N
    : never;

type NonNegativeNumber<N extends NumberType> = NumberType extends N
  ? NumberType
  : IsNonNegative<N> extends true
    ? N
    : never;

type PositiveNumber<N extends NumberType> = NumberType extends N
  ? NumberType
  : IsPositive<N> extends true
    ? N
    : never;

type NonPositiveNumber<N extends NumberType> = NumberType extends N
  ? NumberType
  : IsNonPositive<N> extends true
    ? N
    : never;

type IsZero<N extends NumberType> = `${N}` extends '0' ? true : false;

type IsNonZero<N extends NumberType> = IsZero<N> extends true ? false : true;

type IsNegative<N extends NumberType> = `${N}` extends `-${string}`
  ? true
  : false;

type IsNonNegative<N extends NumberType> =
  IsNegative<N> extends true ? false : true;

type IsPositive<N extends NumberType> = BoolAnd<IsNonZero<N>, IsNonNegative<N>>;

type IsNonPositive<N extends NumberType> = BoolNot<IsPositive<N>>;

const createConstraintsPredicate =
  (constraints: Constraints) =>
  (value: NumberType): Result<true, string> => {
    const {
      nonZero,
      negative,
      nonNegative,
      positive,
      nonPositive,
      gt,
      gte,
      min,
      lt,
      lte,
      max,
      multipleOf,
      step,
      ..._rest
    } = constraints;

    expectType<keyof typeof _rest, never>('=');

    if (nonZero === true && !(value !== 0n)) {
      return Result.err(errorMessage(value, 'nonZero', true));
    }

    if (negative === true && !(value < 0n)) {
      return Result.err(errorMessage(value, 'negative', true));
    }

    if (nonNegative === true && !(value >= 0n)) {
      return Result.err(errorMessage(value, 'nonNegative', true));
    }

    if (positive === true && !(value > 0n)) {
      return Result.err(errorMessage(value, 'positive', true));
    }

    if (nonPositive === true && !(value <= 0n)) {
      return Result.err(errorMessage(value, 'nonPositive', true));
    }

    if (gt !== undefined && !(value > gt)) {
      return Result.err(errorMessage(value, 'gt', gt));
    }

    if (gte !== undefined && !(value >= gte)) {
      return Result.err(errorMessage(value, 'gte', gte));
    }

    if (min !== undefined && !(value >= min)) {
      return Result.err(errorMessage(value, 'min', min));
    }

    if (lt !== undefined && !(value < lt)) {
      return Result.err(errorMessage(value, 'lt', lt));
    }

    if (lte !== undefined && !(value <= lte)) {
      return Result.err(errorMessage(value, 'lte', lte));
    }

    if (max !== undefined && !(value <= max)) {
      return Result.err(errorMessage(value, 'max', max));
    }

    // `value % 0n` throws a RangeError, so the zero divisor is handled
    // separately: it only admits zero.
    if (multipleOf !== undefined) {
      if (multipleOf === 0n) {
        if (value !== 0n) {
          return Result.err(errorMessage(value, 'multipleOf', multipleOf));
        }
      } else if (value % multipleOf !== 0n) {
        return Result.err(errorMessage(value, 'multipleOf', multipleOf));
      }
    }

    if (step !== undefined) {
      if (step === 0n) {
        if (value !== 0n) {
          return Result.err(errorMessage(value, 'step', step));
        }
      } else if (value % step !== 0n) {
        return Result.err(errorMessage(value, 'step', step));
      }
    }

    return Result.ok(true);
  };

const errorMessage = (
  value: NumberType,
  constraintName: string,
  constraintValue: NumberType | boolean,
): string =>
  `defaultValue [${value}] for bigint does not satisfy the constraint ${constraintName} = ${constraintValue}` as const;
