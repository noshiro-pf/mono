/* eslint-disable unicorn/no-negated-comparison */
import { Arr, expectType, isBigint, Result } from 'ts-data-forge';
import { type ArrayElement, type BoolAnd, type BoolNot } from 'ts-type-forge';
import {
  attachConstraints,
  type ConstrainedType,
  fillConstraints,
  type FillConstraints,
  type NoConstraints,
} from '../constraints/index.mjs';
import { refine } from '../other-types/index.mjs';
import {
  createPrimitiveType,
  type NumericConstraintViolation,
} from '../utils/index.mjs';

type NumberType = bigint;

export function bigint(
  defaultValue?: NumberType,
): ConstrainedType<NumberType, BigintConstraintsOf<NoConstraints>>;

export function bigint<N extends NumberType, const C extends Constraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): ConstrainedType<NumberType, BigintConstraintsOf<C>>;

export function bigint(
  defaultValue: NumberType = 0n,
  constraints?: Constraints,
): ConstrainedType<NumberType, BigintConstraintsOf<Constraints>> {
  const baseType = createPrimitiveType({
    typeName: 'bigint',
    defaultValue,
    is: isBigint,
  });

  const constraintValues = fillConstraints<Required<Constraints>, Constraints>(
    bigintConstraintKeys,
    constraints,
  );

  if (constraints === undefined || Arr.isEmpty(Object.keys(constraints))) {
    return attachConstraints(baseType, constraintValues);
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

  return attachConstraints(
    refine({
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
    }),
    constraintValues,
  );
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

/**
 * The set of constraints accepted by {@link bigint}.
 */
export type BigintTypeConstraints = Constraints;

/**
 * The constraint values carried by a {@link bigint} type created with the
 * constraints `C`: every key of {@link BigintTypeConstraints}, taking the
 * value `C` gives it and `undefined` for the keys `C` leaves out.
 */
export type BigintConstraintsOf<C extends BigintTypeConstraints> =
  FillConstraints<Required<Constraints>, C>;

/**
 * Every key of {@link Constraints}, in the order the runtime predicate checks
 * them. The `expectType` below keeps it in step with the type.
 */
const bigintConstraintKeys = [
  'nonZero',
  'negative',
  'nonNegative',
  'positive',
  'nonPositive',
  'gt',
  'gte',
  'min',
  'lt',
  'lte',
  'max',
  'multipleOf',
  'step',
] as const satisfies readonly (keyof Constraints)[];

expectType<ArrayElement<typeof bigintConstraintKeys>, keyof Constraints>('=');

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
      return Result.err({ constraint: 'gt', value: gt.toString() } as const);
    }

    if (gte !== undefined && !(value >= gte)) {
      return Result.err({ constraint: 'gte', value: gte.toString() } as const);
    }

    if (min !== undefined && !(value >= min)) {
      return Result.err({ constraint: 'min', value: min.toString() } as const);
    }

    if (lt !== undefined && !(value < lt)) {
      return Result.err({ constraint: 'lt', value: lt.toString() } as const);
    }

    if (lte !== undefined && !(value <= lte)) {
      return Result.err({ constraint: 'lte', value: lte.toString() } as const);
    }

    if (max !== undefined && !(value <= max)) {
      return Result.err({ constraint: 'max', value: max.toString() } as const);
    }

    // `value % 0n` throws a RangeError, so the zero divisor is handled
    // separately: it only admits zero.
    if (multipleOf !== undefined) {
      if (multipleOf === 0n) {
        if (value !== 0n) {
          return Result.err({
            constraint: 'multipleOf',
            value: multipleOf.toString(),
          } as const);
        }
      } else if (value % multipleOf !== 0n) {
        return Result.err({
          constraint: 'multipleOf',
          value: multipleOf.toString(),
        } as const);
      }
    }

    if (step !== undefined) {
      if (step === 0n) {
        if (value !== 0n) {
          return Result.err({
            constraint: 'step',
            value: step.toString(),
          } as const);
        }
      } else if (value % step !== 0n) {
        return Result.err({
          constraint: 'step',
          value: step.toString(),
        } as const);
      }
    }

    return Result.ok(true);
  };

const defaultValueErrorMessage = (
  value: NumberType,
  violation: NumericConstraintViolation,
): string =>
  `defaultValue [${value}] for bigint does not satisfy the constraint ${violation.constraint} = ${violation.value}` as const;
