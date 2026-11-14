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

    /**
     * The value must be an integer multiple of this number; `0` admits only
     * `0`.
     *
     * A value passes when its floating-point remainder `value % multipleOf` is
     * `0`, or when it is a multiple as the decimals both are written as (their
     * shortest round-trip notation): both are scaled by the power of ten that
     * makes them integers, and the integers are divided. So with `0.1`, `0.3`
     * passes although `0.3 % 0.1` is `0.09999999999999998`, while `0.35` does
     * not; with `1.1`, `3 * 1.1`, written `3.3000000000000003`, passes since
     * its remainder is `0`. The decimal comparison needs both scaled integers
     * to be safe integers; when one is not (`123456789012345.67` with `0.01`,
     * say), the remainder alone decides.
     */
    multipleOf: number;

    /**
     * The same check as `multipleOf`: a multiple counted from `0`, whatever
     * `min` is, whereas an `<input>` with a `min` counts its `step` from that
     * `min`.
     */
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

type DecimalNotation = Readonly<{
  digits: number;
  places: number;
}>;

/**
 * The shortest round-trip notation of the finite `n` as the integer `digits`
 * and the number of `places` its decimal point sits left of their end, so that
 * `n` is `digits / 10 ** places`. `places` is negative for an exponent notation
 * such as `1e+21`. `digits` is exact while it is a safe integer.
 */
const decimalNotationOf = (n: number): DecimalNotation => {
  const [mantissa = '', exponent = '0'] = n.toString().split('e', 2);

  const [integerPart = '', fraction = ''] = mantissa.split('.', 2);

  // Both strings come from `Number.prototype.toString` of a finite number and
  // always parse. Were one not to, falling back to `NaN`, rather than throwing
  // in a validator, makes the decimal comparison fail and leaves only the
  // remainder able to accept the value.
  return {
    digits: Result.unwrapOkOr(
      Num.safeParseFloat(`${integerPart}${fraction}`),
      Number.NaN,
    ),
    places:
      fraction.length -
      Result.unwrapOkOr(Num.safeParseFloat(exponent), Number.NaN),
  };
};

/**
 * `notation` scaled to an integer of `places` decimal places, for `places` no
 * less than `notation.places`. A result that is a safe integer is exact: the
 * digits and the power of ten are then exact, and so is their product.
 */
const scaleNotation = (notation: DecimalNotation, places: number): number =>
  notation.digits * 10 ** (places - notation.places);

/**
 * A predicate for whether a number is an integer multiple of `divisor`, which
 * works out what it reads from `divisor` once rather than for every value. With
 * no divisor, every number passes.
 *
 * A zero divisor admits only zero, the one multiple of zero. The remainder
 * cannot say so, since `value % 0` is NaN for every value, zero included.
 *
 * A value whose floating-point remainder is `0` passes: it is an exact multiple
 * of the divisor as the binary numbers both are, which is all that is asked of
 * a safe-integer divisor, or of one that is not finite. For any other divisor
 * the remainder is not enough, since `0.3 % 0.1` is `0.09999999999999998`, so a
 * decimal divisor such as `0.1` or `0.01` would reject most of its own
 * multiples. A value the remainder rejects is therefore also compared in
 * decimal: the value and the divisor are read as integers scaled by the same
 * power of ten, from the digits of their shortest round-trip notation (what a
 * literal or a JSON number is written with), and the remainder is taken of
 * those integers. The digits are read rather than computed by rounding
 * `value * 10 ** places`, which lands on an adjacent integer for some values
 * near `Number.MAX_SAFE_INTEGER`. When a scaled integer is not a safe integer,
 * or both are integers, the floating-point remainder has already answered.
 */
const multipleOfPredicate = (
  divisor: number | undefined,
): ((value: number) => boolean) => {
  if (divisor === undefined) {
    return () => true;
  }

  if (!Num.isNonZero(divisor)) {
    return (value) => value === 0;
  }

  if (Number.isSafeInteger(divisor) || !Number.isFinite(divisor)) {
    return (value) => Num.rem(value, divisor) === 0;
  }

  const divisorNotation = decimalNotationOf(divisor);

  return (value) => {
    if (Num.rem(value, divisor) === 0) {
      return true;
    }

    if (!Number.isFinite(value)) {
      return false;
    }

    // Only a value the remainder rejects pays for reading its notation. A type
    // with both `multipleOf` and `step` may read it twice, which is not worth
    // sharing between the two predicates.
    const valueNotation = decimalNotationOf(value);

    // `places` is not positive only for an integer divisor beyond the safe
    // integers and an integer value, whose remainder is exact.
    const places = Math.max(valueNotation.places, divisorNotation.places);

    const scaledValue = scaleNotation(valueNotation, places);

    const scaledDivisor = scaleNotation(divisorNotation, places);

    return (
      places > 0 &&
      Number.isSafeInteger(scaledValue) &&
      Number.isSafeInteger(scaledDivisor) &&
      // Always true here: the divisor is non-zero, and `places` is at least
      // `divisorNotation.places`, so its digits are scaled up, never down to
      // zero. It narrows the type `Num.rem` asks.
      Num.isNonZero(scaledDivisor) &&
      Num.rem(scaledValue, scaledDivisor) === 0
    );
  };
};

const createConstraintsPredicate = (
  constraints: NumberTypeConstraints,
): ((value: number) => Result<true, NumericConstraintViolation>) => {
  const isMultipleOfMultipleOf = multipleOfPredicate(constraints.multipleOf);

  const isMultipleOfStep = multipleOfPredicate(constraints.step);

  return (value) => {
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

    if (multipleOf !== undefined && !isMultipleOfMultipleOf(value)) {
      return Result.err({
        constraint: 'multipleOf',
        value: multipleOf.toString(),
      } as const);
    }

    if (step !== undefined && !isMultipleOfStep(value)) {
      return Result.err({
        constraint: 'step',
        value: step.toString(),
      } as const);
    }

    return Result.ok(true);
  };
};

const defaultValueErrorMessage = (
  value: number,
  violation: NumericConstraintViolation,
): string =>
  `defaultValue [${value}] for number does not satisfy the constraint ${violation.constraint} = ${violation.value}` as const;

const STRUCTURE: TypeStructure = { kind: 'number' } as const;
