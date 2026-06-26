import { Arr, expectType, Int, isNumber, Result } from 'ts-data-forge';
import {
  type Brand,
  type FiniteNumber,
  type IsNever,
  type NegativeInt,
  type NonZeroFiniteNumber,
  type NonZeroInt,
  type PositiveInt,
  type Uint,
} from 'ts-type-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export function number(defaultValue?: number): Type<number>;

export function number<N extends number, const C extends Constraints>(
  defaultValue: N & DefaultValueType<N, C>,
  constraints: C,
): Type<ConstraintsToResultType<C>>;

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

  const constraintsPredicate = createConstraintsPredicate(constraints);

  const defaultValueConstraintsCheck = constraintsPredicate(defaultValue);

  if (Result.isErr(defaultValueConstraintsCheck)) {
    throw new Error(defaultValueConstraintsCheck.value);
  }

  return refine({
    baseType,
    defaultValue,
    is: (value): value is number => Result.isOk(constraintsPredicate(value)),
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
    multipleOf: number;
    step: number;

    finite: true;
    int: true;
    nonzero: true;
    negative: true;
    nonNegative: true;
    positive: true;
    nonPositive: true;
  }>
>;

type DefaultValueType<
  N extends number,
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
    ? number
    : Brand<number, R['brandKeys'], R['brandFalseKeys']>;

type ConstraintsToResultBrandKeys<C extends Constraints> =
  | (C extends Readonly<{ int: true }>
      ? Readonly<{ brandKeys: 'Int' | 'Finite'; brandFalseKeys: 'NaNValue' }>
      : never)
  | (C extends Readonly<{ finite: true }>
      ? Readonly<{ brandKeys: 'Finite'; brandFalseKeys: 'NaNValue' }>
      : never)
  | (C extends Readonly<{ nonzero: true }>
      ? Readonly<{ brandKeys: '!=0'; brandFalseKeys: 'NaNValue' }>
      : never)
  | (C extends Readonly<{ negative: true }>
      ? Readonly<{
          brandKeys: '!=0' | '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32';
          brandFalseKeys: '>=0' | 'NaNValue';
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
          brandFalseKeys: 'NaNValue';
        }>
      : never)
  | (C extends Readonly<{ nonNegative: true }>
      ? Readonly<{
          brandKeys: '>=0' | '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31';
          brandFalseKeys: 'NaNValue';
        }>
      : never)
  | (C extends Readonly<{ nonPositive: true }>
      ? Readonly<{
          brandKeys: '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32';
          brandFalseKeys: '>=0' | 'NaNValue';
        }>
      : never);

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

expectType<BrandKeysPositiveInt['brandFalseKeys'], 'NaNValue'>('=');

expectType<ConstraintsToResultType<Readonly<{ finite: true }>>, FiniteNumber>(
  '=',
);

expectType<
  ConstraintsToResultType<Readonly<{ finite: true; nonzero: true }>>,
  NonZeroFiniteNumber
>('=');

expectType<
  ConstraintsToResultType<Readonly<{ int: true; nonzero: true }>>,
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
  ConstraintsToResultType<Readonly<{ int: true; nonNegative: true }>>,
  Uint
>('=');

type DefaultValueWhenNonZeroIsOn<N extends number, C extends Constraints> =
  C extends Readonly<{ nonzero: true }> ? NonZeroNumber<N> : number;

type DefaultValueWhenNegativeIsOn<N extends number, C extends Constraints> =
  C extends Readonly<{ negative: true }> ? NegativeNumber<N> : number;

type DefaultValueWhenNonNegativeIsOn<N extends number, C extends Constraints> =
  C extends Readonly<{ nonNegative: true }> ? NonNegativeNumber<N> : number;

type DefaultValueWhenPositiveIsOn<N extends number, C extends Constraints> =
  C extends Readonly<{ positive: true }> ? PositiveNumber<N> : number;

type DefaultValueWhenNonPositiveIsOn<N extends number, C extends Constraints> =
  C extends Readonly<{ nonPositive: true }> ? NonPositiveNumber<N> : number;

type NonZeroNumber<N extends number> = number extends N
  ? number
  : IsNonZero<N> extends true
    ? N
    : never;

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

type IsNonZero<N extends number> = N extends 0 ? false : true;

type IsNegative<N extends number> = `${N}` extends `-${string}` ? true : false;

type IsNonNegative<N extends number> =
  IsNegative<N> extends true ? false : true;

type IsPositive<N extends number> = N extends 0 ? false : IsNonNegative<N>;

type IsNonPositive<N extends number> =
  IsPositive<N> extends true ? false : true;

const createConstraintsPredicate =
  (constraints: Constraints) =>
  (value: number): Result<true, string> => {
    const {
      gt,
      gte,
      lt,
      lte,
      min,
      max,
      multipleOf,
      step,
      finite,
      int,
      nonzero,
      positive,
      nonNegative,
      negative,
      nonPositive,
      ..._rest
    } = constraints;

    expectType<keyof typeof _rest, never>('=');

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

    if (multipleOf !== undefined && value % multipleOf !== 0) {
      return Result.err(errorMessage(value, 'multipleOf', multipleOf));
    }

    if (step !== undefined && value % step !== 0) {
      return Result.err(errorMessage(value, 'step', step));
    }

    if (nonzero === true && !(value !== 0)) {
      return Result.err(errorMessage(value, 'nonzero', true));
    }

    if (positive === true && !(value > 0)) {
      return Result.err(errorMessage(value, 'positive', true));
    }

    if (nonNegative === true && !(value >= 0)) {
      return Result.err(errorMessage(value, 'nonNegative', true));
    }

    if (negative === true && !(value < 0)) {
      return Result.err(errorMessage(value, 'negative', true));
    }

    if (nonPositive === true && !(value <= 0)) {
      return Result.err(errorMessage(value, 'nonPositive', true));
    }

    if (int === true && !Int.is(value)) {
      return Result.err(errorMessage(value, 'int', true));
    }

    if (finite === true && !Number.isFinite(value)) {
      return Result.err(errorMessage(value, 'finite', true));
    }

    return Result.ok(true);
  };

const errorMessage = (
  value: number,
  constraintName: string,
  constraintValue: number | boolean,
): string =>
  `defaultValue [${value}] for number does not satisfy the constraint ${constraintName} = ${constraintValue}` as const;
