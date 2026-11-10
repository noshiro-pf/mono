import { Arr, expectType, Int, isNumber, Num, Result } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import type {
  ArrayElement,
  BoolAnd,
  BoolNot,
  Brand,
  FiniteNumber,
  IsNever,
  NegativeInt,
  NonPositiveInt,
  NonZeroFiniteNumber,
  NonZeroInt,
  PositiveInt,
  SafeInt,
  SafeUint,
  StrictPick,
  Uint,
} from 'ts-type-forge';
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

export function number(
  defaultValue?: number,
): ConstrainedType<number, NumberConstraintsOf<NoConstraints>>;

export function number<N extends number, const C extends NumberTypeConstraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): ConstrainedType<ConstraintsToResultType<C>, NumberConstraintsOf<C>>;

export function number(
  defaultValue: number = 0,
  constraints?: NumberTypeConstraints,
): ConstrainedType<number, NumberConstraintsOf<NumberTypeConstraints>> {
  const baseType = createPrimitiveType({
    typeName: 'number',
    defaultValue,
    is: isNumber,
    structure: STRUCTURE,
  });

  const constraintValues = fillConstraints<
    Required<NumberTypeConstraints>,
    NumberTypeConstraints
  >(numberConstraintKeys, constraints);

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
        is: (value): value is number =>
          Result.isOk(constraintsPredicate(value)),
        typeName: 'number',
        getConstraintDetails: (value) => {
          const result = constraintsPredicate(value);

          return Result.isErr(result)
            ? {
                kind: 'numeric-constraint',
                numericType: 'number',
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
 * The set of constraints accepted by {@link number}.
 */
export type NumberTypeConstraints = Partial<
  Readonly<{
    finite: true;
    int: true;
    safeInteger: true;
    nonZero: true;
    negative: true;
    nonNegative: true;
    positive: true;
    nonPositive: true;

    gt: number;
    gte: number;
    min: number;
    lt: number;
    lte: number;
    max: number;
    multipleOf: number;
    step: number;
  }>
>;

/**
 * The numeric-range subset of {@link NumberTypeConstraints}. These constraints
 * (`gt`, `gte`, `min`, `lt`, `lte`, `max`, `multipleOf`, `step`) add runtime
 * validation without changing the result brand, so the branded number types
 * under `predefined/brand/number` accept only this subset. To build a different
 * brand from a plain number, use {@link number} with the predicate constraints
 * instead, or the dedicated branded constructor for the target type.
 */
export type NumberRangeConstraints = StrictPick<
  NumberTypeConstraints,
  'gt' | 'gte' | 'min' | 'lt' | 'lte' | 'max' | 'multipleOf' | 'step'
>;

/**
 * The constraint values carried by a {@link number} type created with the
 * constraints `C`: every key of {@link NumberTypeConstraints}, taking the value
 * `C` gives it and `undefined` for the keys `C` leaves out.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const Age = t.number(0, { int: true, min: 0, max: 120 });
 *
 * const max: 120 = Age.constraints.max;
 *
 * const step: undefined = Age.constraints.step;
 *
 * assert.strictEqual(max, 120);
 *
 * assert.isUndefined(step);
 * ```
 */
export type NumberConstraintsOf<C extends NumberTypeConstraints> =
  FillConstraints<Required<NumberTypeConstraints>, C>;

/**
 * Every key of {@link NumberTypeConstraints}, in the order the runtime predicate
 * checks them. The `expectType` below keeps it in step with the type.
 */
const numberConstraintKeys = [
  'finite',
  'int',
  'safeInteger',
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
] as const satisfies readonly (keyof NumberTypeConstraints)[];

expectType<
  ArrayElement<typeof numberConstraintKeys>,
  keyof NumberTypeConstraints
>('=');

/**
 * @internal The type `defaultValue` must have for the constraints `C`, a step
 * of a parameter type, which a caller meets with the argument it passes.
 */
type DefaultValueType<
  N extends number,
  C extends NumberTypeConstraints,
> = DefaultValueWhenNonZeroIsOn<N, C> &
  DefaultValueWhenNegativeIsOn<N, C> &
  DefaultValueWhenNonNegativeIsOn<N, C> &
  DefaultValueWhenPositiveIsOn<N, C> &
  DefaultValueWhenNonPositiveIsOn<N, C>;

/**
 * @internal What the `Type` `number` returns for the constraints `C` validates;
 * a consumer reads it with `TypeOf`.
 */
type ConstraintsToResultType<C extends NumberTypeConstraints> =
  ConstraintsToResultHelperType<ConstraintsToResultBrandKeys<C>>;

type ConstraintsToResultHelperType<
  R extends Readonly<{ brandKeys: string; brandFalseKeys: string }>,
> =
  IsNever<R> extends true
    ? number
    : Brand<number, R['brandKeys'], R['brandFalseKeys']>;

type ConstraintsToResultBrandKeys<C extends NumberTypeConstraints> =
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
            '>=0' | '!=0' | '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31';
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

type DefaultValueWhenNonZeroIsOn<
  N extends number,
  C extends NumberTypeConstraints,
> = C extends Readonly<{ nonZero: true }> ? NonZeroNumber<N> : number;

type DefaultValueWhenNegativeIsOn<
  N extends number,
  C extends NumberTypeConstraints,
> = C extends Readonly<{ negative: true }> ? NegativeNumber<N> : number;

type DefaultValueWhenNonNegativeIsOn<
  N extends number,
  C extends NumberTypeConstraints,
> = C extends Readonly<{ nonNegative: true }> ? NonNegativeNumber<N> : number;

type DefaultValueWhenPositiveIsOn<
  N extends number,
  C extends NumberTypeConstraints,
> = C extends Readonly<{ positive: true }> ? PositiveNumber<N> : number;

type DefaultValueWhenNonPositiveIsOn<
  N extends number,
  C extends NumberTypeConstraints,
> = C extends Readonly<{ nonPositive: true }> ? NonPositiveNumber<N> : number;

type NonZeroNumber<N extends number> = number extends N
  ? number
  : IsZero<N> extends true
    ? never
    : N;

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

type IsZero<N extends number> = `${N}` extends '0' ? true : false;

type IsNonZero<N extends number> = IsZero<N> extends true ? false : true;

type IsNegative<N extends number> = `${N}` extends `-${string}` ? true : false;

type IsNonNegative<N extends number> =
  IsNegative<N> extends true ? false : true;

type IsPositive<N extends number> = BoolAnd<IsNonZero<N>, IsNonNegative<N>>;

type IsNonPositive<N extends number> = BoolNot<IsPositive<N>>;

const createConstraintsPredicate =
  (constraints: NumberTypeConstraints) =>
  (value: number): Result<true, NumericConstraintViolation> => {
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
      return Result.err({ constraint: 'finite', value: true } as const);
    }

    if (int === true && !Int.is(value)) {
      return Result.err({ constraint: 'int', value: true } as const);
    }

    if (safeInteger === true && !Number.isSafeInteger(value)) {
      return Result.err({ constraint: 'safeInteger', value: true } as const);
    }

    // Each check says "the flag is on, and the condition it asks for does not
    // hold" — the negation of the condition itself, not its inverse. That is
    // what rejects NaN: every order comparison with NaN is false, so
    // `!(value < 0)` holds for NaN where `value >= 0` does not, and the result
    // type promises a number that is not NaN.
    /* eslint-disable ts-restrictions/no-negated-comparison -- each check is written as the negated condition on purpose; see above */
    if (nonZero === true && !(value !== 0)) {
      return Result.err({ constraint: 'nonZero', value: true } as const);
    }

    if (negative === true && !(value < 0)) {
      return Result.err({ constraint: 'negative', value: true } as const);
    }

    if (nonNegative === true && !(value >= 0)) {
      return Result.err({ constraint: 'nonNegative', value: true } as const);
    }

    if (positive === true && !(value > 0)) {
      return Result.err({ constraint: 'positive', value: true } as const);
    }

    if (nonPositive === true && !(value <= 0)) {
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

    // `value % 0` throws a RangeError, so the zero divisor is handled
    // separately: it only admits zero.
    if (multipleOf !== undefined) {
      if (!Num.isNonZero(multipleOf)) {
        if (value !== 0) {
          return Result.err({
            constraint: 'multipleOf',
            value: multipleOf.toString(),
          } as const);
        }
      } else if (Num.rem(value, multipleOf) !== 0) {
        return Result.err({
          constraint: 'multipleOf',
          value: multipleOf.toString(),
        } as const);
      }
    }

    if (step !== undefined) {
      if (!Num.isNonZero(step)) {
        if (value !== 0) {
          return Result.err({
            constraint: 'step',
            value: step.toString(),
          } as const);
        }
      } else if (Num.rem(value, step) !== 0) {
        return Result.err({
          constraint: 'step',
          value: step.toString(),
        } as const);
      }
    }

    return Result.ok(true);
  };

const defaultValueErrorMessage = (
  value: number,
  violation: NumericConstraintViolation,
): string =>
  `defaultValue [${value}] for number does not satisfy the constraint ${violation.constraint} = ${violation.value}` as const;

const STRUCTURE: TypeStructure = { kind: 'number' } as const;
