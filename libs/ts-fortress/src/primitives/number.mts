/* eslint-disable unicorn/no-negated-comparison */
import { Arr, expectType, Int, isNumber, Result } from 'ts-data-forge';
import {
  type BoolAnd,
  type BoolNot,
  type Brand,
  type FiniteNumber,
  type IsNever,
  type NegativeInt,
  type NonPositiveInt,
  type NonZeroFiniteNumber,
  type NonZeroInt,
  type PositiveInt,
  type SafeInt,
  type SafeUint,
  type Uint,
} from 'ts-type-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

type NumberType = number;

export function number(defaultValue?: NumberType): Type<NumberType>;

export function number<N extends NumberType, const C extends Constraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): Type<ConstraintsToResultType<C>>;

export function number<C extends Constraints>(
  defaultValue: NumberType = 0,
  constraints?: C,
): Type<NumberType> {
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
    typeName: 'number',
  });
}

type Constraints = Partial<
  Readonly<{
    finite: true;
    int: true;
    safeInteger: true;
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

/**
 * The set of constraints accepted by {@link number}.
 */
export type NumberTypeConstraints = Constraints;

/**
 * The numeric-range subset of {@link NumberTypeConstraints}. These constraints
 * (`gt`, `gte`, `min`, `lt`, `lte`, `max`, `multipleOf`, `step`) add runtime
 * validation without changing the result brand, so the branded number types
 * under `predefined/brand/number` accept only this subset. To build a different
 * brand from a plain number, use {@link number} with the predicate constraints
 * instead, or the dedicated branded constructor for the target type.
 */
export type NumberRangeConstraints = Pick<
  NumberTypeConstraints,
  'gt' | 'gte' | 'min' | 'lt' | 'lte' | 'max' | 'multipleOf' | 'step'
>;

type DefaultValueType<
  N extends NumberType,
  C extends Constraints,
> = DefaultValueWhenNonZeroIsOn<N, C> &
  DefaultValueWhenNegativeIsOn<N, C> &
  DefaultValueWhenNonNegativeIsOn<N, C> &
  DefaultValueWhenPositiveIsOn<N, C> &
  DefaultValueWhenNonPositiveIsOn<N, C>;

type ConstraintsToResultType<C extends Constraints> =
  ConstraintsToResultHelperType<ConstraintsToResultBrandKeys<C>>;

type ConstraintsToResultHelperType<
  R extends Readonly<{ brandKeys: string; brandFalseKeys: string }>,
> =
  IsNever<R> extends true
    ? NumberType
    : Brand<NumberType, R['brandKeys'], R['brandFalseKeys']>;

type ConstraintsToResultBrandKeys<C extends Constraints> =
  | (C extends Readonly<{ int: true }>
      ? Readonly<{ brandKeys: 'Int' | 'Finite'; brandFalseKeys: 'NaNValue' }>
      : never)
  | (C extends Readonly<{ safeInteger: true }>
      ? Readonly<{
          brandKeys: 'Finite' | 'Int' | 'SafeInt';
          brandFalseKeys: 'NaNValue';
        }>
      : never)
  | (C extends Readonly<{ finite: true }>
      ? Readonly<{ brandKeys: 'Finite'; brandFalseKeys: 'NaNValue' }>
      : never)
  | (C extends Readonly<{ nonZero: true }>
      ? Readonly<{ brandKeys: '!=0'; brandFalseKeys: 'NaNValue' }>
      : never)
  | (C extends Readonly<{ negative: true }>
      ? Readonly<{
          brandKeys: '!=0' | '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32' | '<=0';
          brandFalseKeys: '>=0' | 'NaNValue';
        }>
      : never)
  | (C extends Readonly<{ nonNegative: true }>
      ? Readonly<{
          brandKeys: '>=0' | '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31';
          brandFalseKeys: 'NaNValue';
        }>
      : never)
  | (C extends Readonly<{ positive: true }>
      ? Readonly<{
          brandKeys:
            | '>=0'
            | '!=0'
            | '> -2^16'
            | '> -2^32'
            | '>= -2^15'
            | '>= -2^31';
          brandFalseKeys: '<=0' | 'NaNValue';
        }>
      : never)
  | (C extends Readonly<{ nonPositive: true }>
      ? Readonly<{
          brandKeys: '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32' | '<=0';
          brandFalseKeys: 'NaNValue';
        }>
      : never);

{
  type BrandKeysInt = ConstraintsToResultBrandKeys<Readonly<{ int: true }>>;

  expectType<BrandKeysInt['brandKeys'], 'Finite' | 'Int'>('=');

  expectType<BrandKeysInt['brandFalseKeys'], 'NaNValue'>('=');

  type BrandKeysPositiveInt = ConstraintsToResultBrandKeys<
    Readonly<{ int: true; positive: true }>
  >;

  expectType<
    BrandKeysPositiveInt['brandKeys'],
    | 'Int'
    | 'Finite'
    | '!=0'
    | '>=0'
    | '> -2^16'
    | '> -2^32'
    | '>= -2^15'
    | '>= -2^31'
  >('=');

  expectType<BrandKeysPositiveInt['brandFalseKeys'], '<=0' | 'NaNValue'>('=');

  expectType<ConstraintsToResultType<Readonly<{ finite: true }>>, FiniteNumber>(
    '=',
  );

  expectType<
    ConstraintsToResultType<Readonly<{ finite: true; nonZero: true }>>,
    NonZeroFiniteNumber
  >('=');

  expectType<
    ConstraintsToResultType<Readonly<{ int: true; nonZero: true }>>,
    NonZeroInt
  >('=');

  expectType<
    ConstraintsToResultType<Readonly<{ int: true; positive: true }>>,
    PositiveInt
  >('=');

  expectType<
    ConstraintsToResultType<Readonly<{ int: true; negative: true }>>,
    NegativeInt
  >('=');

  expectType<
    ConstraintsToResultType<Readonly<{ int: true; nonPositive: true }>>,
    NonPositiveInt
  >('=');

  expectType<
    ConstraintsToResultType<Readonly<{ int: true; nonNegative: true }>>,
    Uint
  >('=');

  expectType<ConstraintsToResultType<Readonly<{ safeInteger: true }>>, SafeInt>(
    '=',
  );

  expectType<
    ConstraintsToResultType<Readonly<{ safeInteger: true; nonNegative: true }>>,
    SafeUint
  >('=');
}

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
      finite,
      int,
      safeInteger,
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

    if (finite === true && !Number.isFinite(value)) {
      return Result.err(errorMessage(value, 'finite', true));
    }

    if (int === true && !Int.is(value)) {
      return Result.err(errorMessage(value, 'int', true));
    }

    if (safeInteger === true && !Number.isSafeInteger(value)) {
      return Result.err(errorMessage(value, 'safeInteger', true));
    }

    if (nonZero === true && !(value !== 0)) {
      return Result.err(errorMessage(value, 'nonZero', true));
    }

    if (negative === true && !(value < 0)) {
      return Result.err(errorMessage(value, 'negative', true));
    }

    if (nonNegative === true && !(value >= 0)) {
      return Result.err(errorMessage(value, 'nonNegative', true));
    }

    if (positive === true && !(value > 0)) {
      return Result.err(errorMessage(value, 'positive', true));
    }

    if (nonPositive === true && !(value <= 0)) {
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

    // `value % 0` throws a RangeError, so the zero divisor is handled
    // separately: it only admits zero.
    if (multipleOf !== undefined) {
      if (multipleOf === 0) {
        if (value !== 0) {
          return Result.err(errorMessage(value, 'multipleOf', multipleOf));
        }
      } else if (value % multipleOf !== 0) {
        return Result.err(errorMessage(value, 'multipleOf', multipleOf));
      }
    }

    if (step !== undefined) {
      if (step === 0) {
        if (value !== 0) {
          return Result.err(errorMessage(value, 'step', step));
        }
      } else if (value % step !== 0) {
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
  `defaultValue [${value}] for number does not satisfy the constraint ${constraintName} = ${constraintValue}` as const;
