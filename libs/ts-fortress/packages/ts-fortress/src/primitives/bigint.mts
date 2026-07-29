/* eslint-disable unicorn/no-negated-comparison */
import { Arr, expectType, isBigint, Result } from 'ts-data-forge';
import { type BoolAnd, type BoolNot } from 'ts-type-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import {
  createPrimitiveType,
  type NumericConstraintViolation,
} from '../utils/index.mjs';

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
    throw new Error(
      defaultValueErrorMessage(
        defaultValue,
        defaultValueConstraintsCheck.value,
      ),
    );
  }

  return refine({
    baseType,
    defaultValue,
    is: (value): value is NumberType =>
      Result.isOk(constraintsPredicate(value)),
    typeName: 'bigint',
    getConstraintDetails: (value) => {
      const result = constraintsPredicate(value);

      return Result.isErr(result)
        ? {
            kind: 'numeric-constraint',
            numericType: 'bigint',
            violation: result.value,
          }
        : undefined;
    },
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
  (value: NumberType): Result<true, NumericConstraintViolation> => {
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
      return Result.err({ constraint: 'nonZero', value: true } as const);
    }

    if (negative === true && !(value < 0n)) {
      return Result.err({ constraint: 'negative', value: true } as const);
    }

    if (nonNegative === true && !(value >= 0n)) {
      return Result.err({ constraint: 'nonNegative', value: true } as const);
    }

    if (positive === true && !(value > 0n)) {
      return Result.err({ constraint: 'positive', value: true } as const);
    }

    if (nonPositive === true && !(value <= 0n)) {
      return Result.err({ constraint: 'nonPositive', value: true } as const);
    }

    if (gt !== undefined && !(value > gt)) {
      return Result.err({ constraint: 'gt', value: String(gt) } as const);
    }

    if (gte !== undefined && !(value >= gte)) {
      return Result.err({ constraint: 'gte', value: String(gte) } as const);
    }

    if (min !== undefined && !(value >= min)) {
      return Result.err({ constraint: 'min', value: String(min) } as const);
    }

    if (lt !== undefined && !(value < lt)) {
      return Result.err({ constraint: 'lt', value: String(lt) } as const);
    }

    if (lte !== undefined && !(value <= lte)) {
      return Result.err({ constraint: 'lte', value: String(lte) } as const);
    }

    if (max !== undefined && !(value <= max)) {
      return Result.err({ constraint: 'max', value: String(max) } as const);
    }

    // `value % 0n` throws a RangeError, so the zero divisor is handled
    // separately: it only admits zero.
    if (multipleOf !== undefined) {
      if (multipleOf === 0n) {
        if (value !== 0n) {
          return Result.err({
            constraint: 'multipleOf',
            value: String(multipleOf),
          } as const);
        }
      } else if (value % multipleOf !== 0n) {
        return Result.err({
          constraint: 'multipleOf',
          value: String(multipleOf),
        } as const);
      }
    }

    if (step !== undefined) {
      if (step === 0n) {
        if (value !== 0n) {
          return Result.err({
            constraint: 'step',
            value: String(step),
          } as const);
        }
      } else if (value % step !== 0n) {
        return Result.err({ constraint: 'step', value: String(step) } as const);
      }
    }

    return Result.ok(true);
  };

const defaultValueErrorMessage = (
  value: NumberType,
  violation: NumericConstraintViolation,
): string =>
  `defaultValue [${value}] for bigint does not satisfy the constraint ${violation.constraint} = ${violation.value}` as const;
