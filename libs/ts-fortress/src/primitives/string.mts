import { isRegExp } from '@sindresorhus/is';
import { Arr, expectType, isString, PositiveInt, Result } from 'ts-data-forge';
import {
  type MaxLengthString,
  type MinLengthString,
  type NonEmptyString,
  type RelaxedExclude,
  type SupportedLength,
} from 'ts-type-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export function string(defaultValue?: string): Type<string>;

export function string<S extends string, const C extends RawConstraints>(
  defaultValue: S & DefaultValueType<S, C>,
  constraints: C,
): Type<ConstraintsResultType<C>>;

export function string<C extends RawConstraints>(
  defaultValue: string = '',
  constraints?: C,
): Type<string> {
  const baseType = createPrimitiveType({
    typeName: 'string',
    defaultValue,
    is: isString,
  });

  if (
    constraints === undefined ||
    Arr.isFixedLengthTuple(Object.keys(constraints), 0)
  ) {
    return baseType;
  }

  const constraintsResult = validateConstraints(constraints);

  if (Result.isErr(constraintsResult)) {
    throw new TypeError(constraintsResult.value);
  }

  const constraintsPredicate = createConstraintsPredicate(
    constraintsResult.value,
  );

  const defaultValueConstraintsCheck = constraintsPredicate(defaultValue);

  if (Result.isErr(defaultValueConstraintsCheck)) {
    throw new Error(defaultValueConstraintsCheck.value);
  }

  return refine({
    baseType,
    defaultValue,
    is: (value): value is string => Result.isOk(constraintsPredicate(value)),
    typeName: 'string',
  });
}

type RawConstraints = Partial<
  Readonly<{
    nonempty: true;
    minLength: number;
    maxLength: number;
    startsWith: string;
    endsWith: string;
    includes: string;
    uppercase: true;
    lowercase: true;
    regex: RegExp;
  }>
>;

type Constraints = Partial<
  Readonly<{
    nonempty: true;
    minLength: PositiveInt;
    maxLength: PositiveInt;
    startsWith: string;
    endsWith: string;
    includes: string;
    uppercase: true;
    lowercase: true;
    regex: RegExp;
  }>
>;

/**
 * The set of constraints accepted by {@link string}.
 */
export type StringTypeConstraints = RawConstraints;

/**
 * The result type produced by {@link string} for a given set of constraints
 * `C` (e.g. `nonempty` yields {@link NonEmptyString}, `minLength` /
 * `maxLength` yield {@link MinLengthString} / {@link MaxLengthString},
 * `startsWith` narrows to a template literal type, etc.).
 */
export type StringConstraintsResultType<C extends StringTypeConstraints> =
  ConstraintsResultType<C>;

type DefaultValueType<
  S extends string,
  C extends RawConstraints,
> = DefaultValueWhenNonemptyIsOn<S, C> &
  DefaultValueWhenMinLengthIsOn<S, C> &
  DefaultValueWhenMaxLengthIsOn<S, C> &
  DefaultValueWhenStartsWithIsOn<C> &
  DefaultValueWhenEndsWithIsOn<C> &
  DefaultValueWhenIncludesIsOn<C> &
  DefaultValueWhenUppercaseIsOn<S, C> &
  DefaultValueWhenLowercaseIsOn<S, C>;

type ConstraintsResultType<C extends RawConstraints> =
  ConstraintsResultTypeWhenNonemptyIsOn<C> &
    ConstraintsResultTypeWhenMinLengthIsOn<C> &
    ConstraintsResultTypeWhenMaxLengthIsOn<C> &
    DefaultValueWhenStartsWithIsOn<C> &
    DefaultValueWhenEndsWithIsOn<C> &
    DefaultValueWhenIncludesIsOn<C>;

type DefaultValueWhenStartsWithIsOn<C extends RawConstraints> =
  C extends Readonly<{
    startsWith: infer S extends string;
  }>
    ? `${S}${string}`
    : string;

type DefaultValueWhenEndsWithIsOn<C extends RawConstraints> =
  C extends Readonly<{
    endsWith: infer E extends string;
  }>
    ? `${string}${E}`
    : string;

type DefaultValueWhenIncludesIsOn<C extends RawConstraints> =
  C extends Readonly<{
    includes: infer M extends string;
  }>
    ? `${string}${M}${string}`
    : string;

type DefaultValueWhenUppercaseIsOn<S extends string, C extends RawConstraints> =
  C extends Readonly<{ uppercase: true }> ? CastUppercase<S> : string;

type DefaultValueWhenLowercaseIsOn<S extends string, C extends RawConstraints> =
  C extends Readonly<{ lowercase: true }> ? CastLowercase<S> : string;

type CastLowercase<S extends string> = S extends Lowercase<S> ? S : never;

type CastUppercase<S extends string> = S extends Uppercase<S> ? S : never;

type DefaultValueWhenNonemptyIsOn<S extends string, C extends RawConstraints> =
  C extends Readonly<{ nonempty: true }> ? RejectEmptyString<S> : string;

type RejectEmptyString<S extends string> = S extends '' ? never : S;

type ConstraintsResultTypeWhenNonemptyIsOn<C extends RawConstraints> =
  C extends Readonly<{ nonempty: true }> ? NonEmptyString : string;

/**
 * The length-bound literals supported at the type level:
 * `RelaxedExclude<SupportedLength, 0>` (i.e. `1 | 2 | ... | 2048`, the shared
 * cap of the branded length-constrained types in ts-type-forge). Only bounds
 * within this range are encoded in the result brand; larger literals and
 * non-literal `number`s collapse to plain `string` to keep the type-level
 * computation cheap (the runtime constraint applies regardless). Non-integer
 * bounds and bounds less than 1 throw a `TypeError` when the type is
 * constructed.
 */
type SupportedLengthLiteral = RelaxedExclude<SupportedLength, 0>;

type ConstraintsResultTypeWhenMinLengthIsOn<C extends RawConstraints> =
  C extends Readonly<{ minLength: infer M extends SupportedLengthLiteral }>
    ? MinLengthString<M>
    : string; // minLength outside the supported literal range is not encoded in the brand

type ConstraintsResultTypeWhenMaxLengthIsOn<C extends RawConstraints> =
  C extends Readonly<{ maxLength: infer M extends SupportedLengthLiteral }>
    ? MaxLengthString<M>
    : string; // maxLength outside the supported literal range is not encoded in the brand

type DefaultValueWhenMinLengthIsOn<S extends string, C extends RawConstraints> =
  C extends Readonly<{ minLength: infer M extends SupportedLengthLiteral }>
    ? StringWithMinLength<S, M>
    : string; // the default's length is only checked at runtime for such bounds

type DefaultValueWhenMaxLengthIsOn<S extends string, C extends RawConstraints> =
  C extends Readonly<{ maxLength: infer M extends SupportedLengthLiteral }>
    ? StringWithMaxLength<S, M>
    : string; // the default's length is only checked at runtime for such bounds

type StringWithMinLength<S extends string, N extends number> =
  HasLengthAtLeast<S, N> extends true ? S : never;

type StringWithMaxLength<S extends string, N extends number> =
  HasLengthAtMost<S, N> extends true ? S : never;

type HasLengthAtLeast<
  S extends string,
  N extends number,
  Acc extends readonly unknown[] = readonly [],
> = string extends S
  ? true
  : Acc['length'] extends N
    ? true
    : S extends ''
      ? false
      : S extends `${infer _}${infer Rest}`
        ? HasLengthAtLeast<Rest, N, readonly [...Acc, unknown]>
        : false;

type HasLengthAtMost<
  S extends string,
  N extends number,
  Acc extends readonly unknown[] = readonly [],
> = string extends S
  ? true
  : S extends ''
    ? true
    : Acc['length'] extends N
      ? false
      : S extends `${infer _}${infer Rest}`
        ? HasLengthAtMost<Rest, N, readonly [...Acc, unknown]>
        : false;

const validateConstraints = (
  constraints: RawConstraints,
): Result<Constraints, string> => {
  const result1 = validateLengthConstraint('minLength', constraints.minLength);

  if (Result.isErr(result1)) {
    return Result.err(result1.value);
  }

  const result2 = validateLengthConstraint('maxLength', constraints.maxLength);

  if (Result.isErr(result2)) {
    return Result.err(result2.value);
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Result.ok(constraints as Constraints);
};

const validateLengthConstraint = (
  constraintName: 'maxLength' | 'minLength',
  constraintValue: number | undefined,
): Result<true, string> => {
  if (constraintValue !== undefined && !PositiveInt.is(constraintValue)) {
    return Result.err(
      `${constraintName} constraint for string must be a positive integer, but ${constraintValue} was passed.`,
    );
  }

  return Result.ok(true);
};

const createConstraintsPredicate =
  (constraints: Constraints) =>
  (value: string): Result<true, string> => {
    const {
      nonempty,
      minLength,
      maxLength,
      startsWith,
      endsWith,
      includes,
      uppercase,
      lowercase,
      regex,
      ..._rest
    } = constraints;

    expectType<keyof typeof _rest, never>('=');

    if (nonempty === true && value.length === 0) {
      return Result.err(errorMessage(value, 'nonempty', true));
    }

    if (minLength !== undefined && value.length < minLength) {
      return Result.err(errorMessage(value, 'minLength', minLength));
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return Result.err(errorMessage(value, 'maxLength', maxLength));
    }

    if (startsWith !== undefined && !value.startsWith(startsWith)) {
      return Result.err(errorMessage(value, 'startsWith', startsWith));
    }

    if (endsWith !== undefined && !value.endsWith(endsWith)) {
      return Result.err(errorMessage(value, 'endsWith', endsWith));
    }

    if (includes !== undefined && !value.includes(includes)) {
      return Result.err(errorMessage(value, 'includes', includes));
    }

    if (uppercase === true && value !== value.toUpperCase()) {
      return Result.err(errorMessage(value, 'uppercase', true));
    }

    if (lowercase === true && value !== value.toLowerCase()) {
      return Result.err(errorMessage(value, 'lowercase', true));
    }

    if (regex !== undefined && !regex.test(value)) {
      return Result.err(errorMessage(value, 'regex', regex));
    }

    return Result.ok(true);
  };

const errorMessage = (
  value: string,
  constraintName: string,
  constraintValue: string | number | boolean | RegExp,
): string =>
  `defaultValue "${value}" for string does not satisfy the constraint ${constraintName} = ${isRegExp(constraintValue) ? constraintValue.source : constraintValue}` as const;
