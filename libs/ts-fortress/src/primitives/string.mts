import { isRegExp } from '@sindresorhus/is';
import { Arr, expectType, isString, Result } from 'ts-data-forge';
import { type NonEmptyString } from 'ts-type-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export function string(defaultValue?: string): Type<string>;

export function string<S extends string, const C extends Constraints>(
  defaultValue: S & DefaultValueType<S, C>,
  constraints: C,
): Type<ConstraintsResultType<C>>;

export function string<C extends Constraints>(
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
    is: (value): value is string => Result.isOk(constraintsPredicate(value)),
    typeName: 'string',
  });
}

type Constraints = Partial<
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

/**
 * The set of constraints accepted by {@link string}.
 */
export type StringTypeConstraints = Constraints;

/**
 * The result type produced by {@link string} for a given set of constraints
 * `C` (e.g. `nonempty` yields {@link NonEmptyString}, `startsWith` narrows to a
 * template literal type, etc.).
 */
export type StringConstraintsResultType<C extends StringTypeConstraints> =
  ConstraintsResultType<C>;

type DefaultValueType<
  S extends string,
  C extends Constraints,
> = DefaultValueWhenNonemptyIsOn<S, C> &
  DefaultValueWhenMinLengthIsOn<S, C> &
  DefaultValueWhenMaxLengthIsOn<S, C> &
  DefaultValueWhenStartsWithIsOn<C> &
  DefaultValueWhenEndsWithIsOn<C> &
  DefaultValueWhenIncludesIsOn<C> &
  DefaultValueWhenUppercaseIsOn<S, C> &
  DefaultValueWhenLowercaseIsOn<S, C>;

type ConstraintsResultType<C extends Constraints> =
  ConstraintsResultTypeWhenNonemptyIsOn<C> &
    DefaultValueWhenStartsWithIsOn<C> &
    DefaultValueWhenEndsWithIsOn<C> &
    DefaultValueWhenIncludesIsOn<C>;

type DefaultValueWhenStartsWithIsOn<C extends Constraints> =
  C extends Readonly<{
    startsWith: infer S extends string;
  }>
    ? `${S}${string}`
    : string;

type DefaultValueWhenEndsWithIsOn<C extends Constraints> =
  C extends Readonly<{
    endsWith: infer E extends string;
  }>
    ? `${string}${E}`
    : string;

type DefaultValueWhenIncludesIsOn<C extends Constraints> =
  C extends Readonly<{
    includes: infer M extends string;
  }>
    ? `${string}${M}${string}`
    : string;

type DefaultValueWhenUppercaseIsOn<S extends string, C extends Constraints> =
  C extends Readonly<{ uppercase: true }> ? CastUppercase<S> : string;

type DefaultValueWhenLowercaseIsOn<S extends string, C extends Constraints> =
  C extends Readonly<{ lowercase: true }> ? CastLowercase<S> : string;

type CastLowercase<S extends string> = S extends Lowercase<S> ? S : never;

type CastUppercase<S extends string> = S extends Uppercase<S> ? S : never;

type DefaultValueWhenNonemptyIsOn<S extends string, C extends Constraints> =
  C extends Readonly<{ nonempty: true }> ? RejectEmptyString<S> : string;

type RejectEmptyString<S extends string> = S extends '' ? never : S;

type ConstraintsResultTypeWhenNonemptyIsOn<C extends Constraints> =
  C extends Readonly<{ nonempty: true }> ? NonEmptyString : string;

type DefaultValueWhenMinLengthIsOn<S extends string, C extends Constraints> =
  C extends Readonly<{ minLength: infer M extends number }>
    ? StringWithMinLength<S, M>
    : string;

type DefaultValueWhenMaxLengthIsOn<S extends string, C extends Constraints> =
  C extends Readonly<{ maxLength: infer M extends number }>
    ? StringWithMaxLength<S, M>
    : string;

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
  : IsNegative<N> extends true
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
  : IsNegative<N> extends true
    ? false
    : S extends ''
      ? true
      : Acc['length'] extends N
        ? false
        : S extends `${infer _}${infer Rest}`
          ? HasLengthAtMost<Rest, N, readonly [...Acc, unknown]>
          : false;

type IsNegative<N extends number> = `${N}` extends `-${string}` ? true : false;

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
