import { expectType } from 'ts-data-forge';
import { type RecordType, type Type } from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { optional, type OptionalPropertyType } from './optional.mjs';
import { record } from './record.mjs';

/**
 * Creates a Partial type. If keysToBeOptional is set, only those keys are
 * optional, otherwise, all properties are optional.
 */
export const partial = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
  const KeysToBeOptional extends NonEmptyArray<keyof R & string>,
>(
  recordType: RecordType<R>,
  options?: PartialReadonly<{
    keysToBeOptional: KeysToBeOptional;
    typeName: string;

    /** @default true */
    allowExcessProperties: boolean;
  }>,
): PartialType<R, KeysToBeOptional> => {
  const typeNameFilled: string =
    options?.typeName ??
    (options?.keysToBeOptional === undefined
      ? `Partial<${recordType.typeName}>`
      : `PartiallyPartial<${recordType.typeName}, ${toUnionKeyString(options.keysToBeOptional)}>`);

  const keysToBeOptional: ReadonlySet<string> = new Set(
    options?.keysToBeOptional ?? Object.keys(recordType.shape),
  );

  const partialShape =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(recordType.shape).map(
        ([k, v]) => [k, keysToBeOptional.has(k) ? optional(v) : v] as const,
      ),
    ) satisfies ReadonlyRecord<string, Type<unknown>> as PartialTypeShape<
      R,
      KeysToBeOptional
    >;

  return record(partialShape, {
    typeName: typeNameFilled,
    allowExcessProperties:
      options?.allowExcessProperties ?? recordType.allowExcessProperties,
  });
};

type PartialTypeShape<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToBeOptional extends NonEmptyArray<keyof R & string> | undefined,
> =
  TypeEq<KeysToBeOptional, undefined> extends true
    ? FullyOptionalType<R>
    : PartiallyOptionalType<R, ArrayElement<KeysToBeOptional>>;

type FullyOptionalType<R extends ReadonlyRecord<string, Type<unknown>>> = {
  readonly [P in keyof R]: OptionalPropertyType<R[P]>;
};

type PartiallyOptionalType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  K extends keyof R,
> = {
  readonly [P in keyof R]: P extends K ? OptionalPropertyType<R[P]> : R[P];
};

export type PartialType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToBeOptional extends NonEmptyArray<keyof R & string> | undefined,
> = RecordType<PartialTypeShape<R, KeysToBeOptional>>;

expectType<
  PartialTypeShape<{ a: Type<0>; b: Type<1>; c: Type<2> }, ['a']>,
  Readonly<{
    a: OptionalPropertyType<Type<0>>;
    b: Type<1>;
    c: Type<2>;
  }>
>('=');

expectType<
  RecordType<
    Readonly<{
      a: Type<0>;
      b: Type<1>;
      c: Type<2>;
    }>
  >,
  Type<
    Readonly<{
      a: 0;
      b: 1;
      c: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: Type<0>;
        b: Type<1>;
        c: Type<2>;
      }>;
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  RecordType<
    Readonly<{
      a: OptionalPropertyType<Type<0>>;
      b: Type<1>;
      c: Type<2>;
    }>
  >,
  Type<
    Readonly<{
      a?: 0;
      b: 1;
      c: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: OptionalPropertyType<Type<0>>;
        b: Type<1>;
        c: Type<2>;
      }>;
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  PartialType<{ a: Type<0>; b: Type<1>; c: Type<2> }, ['a']>,
  Type<
    Readonly<{
      a?: 0;
      b: 1;
      c: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: OptionalPropertyType<Type<0>>;
        b: Type<1>;
        c: Type<2>;
      }>;
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  PartialType<{ a: Type<0>; b: Type<1>; c: Type<2> }, ['a', 'b']>,
  Type<
    Readonly<{
      a?: 0;
      b?: 1;
      c: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: OptionalPropertyType<Type<0>>;
        b: OptionalPropertyType<Type<1>>;
        c: Type<2>;
      }>;
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  PartialType<{ a: Type<0>; b: Type<1>; c: Type<2> }, undefined>,
  Type<
    Readonly<{
      a?: 0;
      b?: 1;
      c?: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: OptionalPropertyType<Type<0>>;
        b: OptionalPropertyType<Type<1>>;
        c: OptionalPropertyType<Type<2>>;
      }>;
      allowExcessProperties: boolean;
    }>
>('=');

expectType<
  PartialType<
    { a: Type<0>; b: Type<1>; c: Type<2> },
    // @ts-expect-error key "d" doesn't exist
    ['a', 'd']
  >,
  0
>('!=');
