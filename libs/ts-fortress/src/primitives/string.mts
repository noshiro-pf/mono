import { isString } from 'ts-data-forge';
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

  if (constraints === undefined || Object.keys(constraints).length === 0) {
    return baseType;
  }

  if (
    constraints.startsWith !== undefined &&
    !defaultValue.startsWith(constraints.startsWith)
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint startsWith = ${constraints.startsWith}`,
    );
  }

  if (
    constraints.endsWith !== undefined &&
    !defaultValue.endsWith(constraints.endsWith)
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint endsWith = ${constraints.endsWith}`,
    );
  }

  if (
    constraints.includes !== undefined &&
    !defaultValue.includes(constraints.includes)
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint includes = ${constraints.includes}`,
    );
  }

  if (
    constraints.uppercase === true &&
    defaultValue !== defaultValue.toUpperCase()
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint uppercase = true`,
    );
  }

  if (
    constraints.lowercase === true &&
    defaultValue !== defaultValue.toLowerCase()
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint lowercase = true`,
    );
  }

  if (constraints.nonempty === true && defaultValue === '') {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint nonempty = true`,
    );
  }

  if (
    constraints.minLength !== undefined &&
    defaultValue.length < constraints.minLength
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint minLength = ${constraints.minLength}`,
    );
  }

  if (
    constraints.maxLength !== undefined &&
    defaultValue.length > constraints.maxLength
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint maxLength = ${constraints.maxLength}`,
    );
  }

  if (
    constraints.regex !== undefined &&
    !constraints.regex.test(defaultValue)
  ) {
    throw new Error(
      `defaultValue "${defaultValue}" for string does not satisfy the constraint regex = ${constraints.regex.source}`,
    );
  }

  const satisfiesConstraints = createConstraintsPredicate(constraints);

  return refine({
    baseType,
    defaultValue,
    is: (value): value is string => satisfiesConstraints(value),
    typeName: 'string',
  });
}

type Constraints = Partial<
  Readonly<{
    startsWith: string;
    endsWith: string;
    includes: string;
    uppercase: boolean;
    lowercase: boolean;
    nonempty: boolean;
    minLength: number;
    maxLength: number;
    regex: DeepReadonly<RegExp>;
  }>
>;

type DefaultValueType<
  S extends string,
  R extends Constraints,
> = DefaultValueWhenStartsWithIsOn<R> &
  DefaultValueWhenEndsWithIsOn<R> &
  DefaultValueWhenIncludesIsOn<R> &
  DefaultValueWhenUppercaseIsOn<S, R> &
  DefaultValueWhenLowercaseIsOn<S, R> &
  DefaultValueWhenNonemptyIsOn<S, R> &
  DefaultValueWhenMinLengthIsOn<S, R> &
  DefaultValueWhenMaxLengthIsOn<S, R>;

type ConstraintsResultType<R extends Constraints> =
  DefaultValueWhenStartsWithIsOn<R> &
    DefaultValueWhenEndsWithIsOn<R> &
    DefaultValueWhenIncludesIsOn<R>;

type DefaultValueWhenStartsWithIsOn<R extends Constraints> =
  R extends Readonly<{
    startsWith: infer S extends string;
  }>
    ? `${S}${string}`
    : string;

type DefaultValueWhenEndsWithIsOn<R extends Constraints> =
  R extends Readonly<{
    endsWith: infer E extends string;
  }>
    ? `${string}${E}`
    : string;

type DefaultValueWhenIncludesIsOn<R extends Constraints> =
  R extends Readonly<{
    includes: infer M extends string;
  }>
    ? `${string}${M}${string}`
    : string;

type DefaultValueWhenUppercaseIsOn<S extends string, R extends Constraints> =
  R extends Readonly<{ uppercase: true }> ? CastUppercase<S> : string;

type DefaultValueWhenLowercaseIsOn<S extends string, R extends Constraints> =
  R extends Readonly<{ lowercase: true }> ? CastLowercase<S> : string;

type CastLowercase<S extends string> = S extends Lowercase<S> ? S : never;

type CastUppercase<S extends string> = S extends Uppercase<S> ? S : never;

type DefaultValueWhenNonemptyIsOn<S extends string, R extends Constraints> =
  R extends Readonly<{ nonempty: true }> ? NonEmptyString<S> : string;

type DefaultValueWhenMinLengthIsOn<S extends string, R extends Constraints> =
  R extends Readonly<{ minLength: infer M extends number }>
    ? StringWithMinLength<S, M>
    : string;

type DefaultValueWhenMaxLengthIsOn<S extends string, R extends Constraints> =
  R extends Readonly<{ maxLength: infer M extends number }>
    ? StringWithMaxLength<S, M>
    : string;

type NonEmptyString<S extends string> = string extends S
  ? string
  : S extends ''
    ? never
    : S;

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
  (value: string): boolean => {
    if (
      constraints.startsWith !== undefined &&
      !value.startsWith(constraints.startsWith)
    ) {
      return false;
    }

    if (
      constraints.endsWith !== undefined &&
      !value.endsWith(constraints.endsWith)
    ) {
      return false;
    }

    if (
      constraints.includes !== undefined &&
      !value.includes(constraints.includes)
    ) {
      return false;
    }

    if (constraints.uppercase === true && value !== value.toUpperCase()) {
      return false;
    }

    if (constraints.lowercase === true && value !== value.toLowerCase()) {
      return false;
    }

    if (constraints.nonempty === true && value.length === 0) {
      return false;
    }

    if (
      constraints.minLength !== undefined &&
      value.length < constraints.minLength
    ) {
      return false;
    }

    if (
      constraints.maxLength !== undefined &&
      value.length > constraints.maxLength
    ) {
      return false;
    }

    if (constraints.regex !== undefined && !constraints.regex.test(value)) {
      return false;
    }

    return true;
  };
