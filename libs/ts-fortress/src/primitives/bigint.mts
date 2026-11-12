import { Arr, expectType, isBigint, Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type { ArrayElement, BoolAnd, BoolNot } from 'ts-type-forge';
import {
  attachConstraints,
  fillConstraints,
  type ConstrainedType,
  type FillConstraints,
  type NoConstraints,
} from '../constraints/index.mjs';
import { refine } from '../other-types/index.mjs';
import { withStructure, type TypeStructure } from '../type.mjs';
import {
  createPrimitiveType,
  type NumericConstraintViolation,
} from '../utils/index.mjs';

export function bigint(
  defaultValue?: bigint,
): ConstrainedType<bigint, BigintConstraintsOf<NoConstraints>>;

export function bigint<N extends bigint, const C extends BigintTypeConstraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): ConstrainedType<bigint, BigintConstraintsOf<C>>;

export function bigint(
  defaultValue: bigint = 0n,
  constraints?: BigintTypeConstraints,
): ConstrainedType<bigint, BigintConstraintsOf<BigintTypeConstraints>> {
  const baseType = createPrimitiveType({
    typeName: 'bigint',
    defaultValue,
    is: isBigint,
    structure: STRUCTURE,
  });

  const constraintValues = fillConstraints<
    Required<BigintTypeConstraints>,
    BigintTypeConstraints
  >(bigintConstraintKeys, constraints);

  if (constraints === undefined || Arr.isEmpty(Object.keys(constraints))) {
    return attachConstraints(baseType, constraintValues);
  }

  const constraintsPredicate = createConstraintsPredicate(constraints);

  const defaultValueConstraintsCheck = constraintsPredicate(defaultValue);

  if (Result.isErr(defaultValueConstraintsCheck)) {
    panic(
      defaultValueErrorMessage(
        defaultValue,
        defaultValueConstraintsCheck.value,
      ),
    );
  }

  return attachConstraints(
    // The constraints are what the refinement checks, and they are on the type
    // itself, so it describes itself as the primitive it refines.
    withStructure(
      refine({
        baseType,
        defaultValue,
        is: (value): value is bigint =>
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
      STRUCTURE,
    ),
    constraintValues,
  );
}

/**
 * The set of constraints accepted by {@link bigint}.
 */
export type BigintTypeConstraints = Partial<
  Readonly<{
    nonZero: true;
    negative: true;
    nonNegative: true;
    positive: true;
    nonPositive: true;

    gt: bigint;
    gte: bigint;
    min: bigint;
    lt: bigint;
    lte: bigint;
    max: bigint;
    multipleOf: bigint;
    step: bigint;
  }>
>;

/**
 * The constraint values carried by a {@link bigint} type created with the
 * constraints `C`: every key of {@link BigintTypeConstraints}, taking the value
 * `C` gives it and `undefined` for the keys `C` leaves out.
 */
export type BigintConstraintsOf<C extends BigintTypeConstraints> =
  FillConstraints<Required<BigintTypeConstraints>, C>;

/**
 * Every key of {@link BigintTypeConstraints}, in the order the runtime predicate
 * checks them. The `expectType` below keeps it in step with the type.
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
] as const satisfies readonly (keyof BigintTypeConstraints)[];

expectType<
  ArrayElement<typeof bigintConstraintKeys>,
  keyof BigintTypeConstraints
>('=');

/**
 * @internal The type `defaultValue` must have for the constraints `C`, a step
 * of a parameter type, which a caller meets with the argument it passes.
 */
type DefaultValueType<
  N extends bigint,
  C extends BigintTypeConstraints,
> = DefaultValueWhenNonZeroIsOn<N, C> &
  DefaultValueWhenNegativeIsOn<N, C> &
  DefaultValueWhenNonNegativeIsOn<N, C> &
  DefaultValueWhenPositiveIsOn<N, C> &
  DefaultValueWhenNonPositiveIsOn<N, C>;

type DefaultValueWhenNonZeroIsOn<
  N extends bigint,
  C extends BigintTypeConstraints,
> = C extends Readonly<{ nonZero: true }> ? NonZeroNumber<N> : bigint;

type DefaultValueWhenNegativeIsOn<
  N extends bigint,
  C extends BigintTypeConstraints,
> = C extends Readonly<{ negative: true }> ? NegativeNumber<N> : bigint;

type DefaultValueWhenNonNegativeIsOn<
  N extends bigint,
  C extends BigintTypeConstraints,
> = C extends Readonly<{ nonNegative: true }> ? NonNegativeNumber<N> : bigint;

type DefaultValueWhenPositiveIsOn<
  N extends bigint,
  C extends BigintTypeConstraints,
> = C extends Readonly<{ positive: true }> ? PositiveNumber<N> : bigint;

type DefaultValueWhenNonPositiveIsOn<
  N extends bigint,
  C extends BigintTypeConstraints,
> = C extends Readonly<{ nonPositive: true }> ? NonPositiveNumber<N> : bigint;

type NonZeroNumber<N extends bigint> = bigint extends N
  ? bigint
  : IsZero<N> extends true
    ? never
    : N;

type NegativeNumber<N extends bigint> = bigint extends N
  ? bigint
  : IsNegative<N> extends true
    ? N
    : never;

type NonNegativeNumber<N extends bigint> = bigint extends N
  ? bigint
  : IsNonNegative<N> extends true
    ? N
    : never;

type PositiveNumber<N extends bigint> = bigint extends N
  ? bigint
  : IsPositive<N> extends true
    ? N
    : never;

type NonPositiveNumber<N extends bigint> = bigint extends N
  ? bigint
  : IsNonPositive<N> extends true
    ? N
    : never;

type IsZero<N extends bigint> = `${N}` extends '0' ? true : false;

type IsNonZero<N extends bigint> = IsZero<N> extends true ? false : true;

type IsNegative<N extends bigint> = `${N}` extends `-${string}` ? true : false;

type IsNonNegative<N extends bigint> =
  IsNegative<N> extends true ? false : true;

type IsPositive<N extends bigint> = BoolAnd<IsNonZero<N>, IsNonNegative<N>>;

type IsNonPositive<N extends bigint> = BoolNot<IsPositive<N>>;

const createConstraintsPredicate =
  (constraints: BigintTypeConstraints) =>
  (value: bigint): Result<true, NumericConstraintViolation> => {
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

    // Each check says "the flag is on, and the condition it asks for does not
    // hold" — the negation of the condition itself, not its inverse, as in
    // `number.mts`, where it is also what rejects NaN.
    /* eslint-disable ts-restrictions/no-negated-comparison -- each check is written as the negated condition on purpose; see above */
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
    /* eslint-enable ts-restrictions/no-negated-comparison */

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
        // eslint-disable-next-line total-functions/no-partial-division -- the zero divisor is the branch above; no type says a bigint is not zero
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
        // eslint-disable-next-line total-functions/no-partial-division -- the zero divisor is the branch above; no type says a bigint is not zero
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
  value: bigint,
  violation: NumericConstraintViolation,
): string =>
  `defaultValue [${value}] for bigint does not satisfy the constraint ${violation.constraint} = ${violation.value}` as const;

const STRUCTURE: TypeStructure = { kind: 'bigint' } as const;
