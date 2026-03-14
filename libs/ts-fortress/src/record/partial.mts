import { expectType } from 'ts-data-forge';
import {
  type ExcessPropertyBehavior,
  type RecordType,
  type Type,
  type UnknownShape,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import { optional, type OptionalPropertyType } from './optional.mjs';
import { record } from './record.mjs';

/**
 * Creates a Partial type. If keysToBeOptional is set, only those keys are
 * optional, otherwise, all properties are optional.
 */
export const partial = <
  const R extends UnknownShape,
  const KeysToBeOptional extends NonEmptyArray<keyof R & string>,
  const ExcessValidation extends ExcessPropertyBehavior = 'strip',
>(
  recordType: RecordType<R, ExcessValidation>,
  options?: Partial<
    Readonly<{
      keysToBeOptional: KeysToBeOptional;
      typeName: string;
      excessPropertyValidation: ExcessValidation;
      excessPropertyFill: Extract<ExcessPropertyBehavior, 'allow' | 'strip'>;
    }>
  >,
): PartialType<R, KeysToBeOptional, ExcessValidation> => {
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
    ) satisfies UnknownShape as PartialTypeShape<R, KeysToBeOptional>;

  return record(partialShape, {
    typeName: typeNameFilled,
    excessPropertyValidation:
      options?.excessPropertyValidation ?? recordType.excessPropertyValidation,
    excessPropertyFill:
      options?.excessPropertyFill ?? recordType.excessPropertyFill,
  });
};

type PartialTypeShape<
  R extends UnknownShape,
  KeysToBeOptional extends NonEmptyArray<keyof R & string> | undefined,
> =
  TypeEq<KeysToBeOptional, undefined> extends true
    ? FullyOptionalType<R>
    : PartiallyOptionalType<R, ArrayElement<KeysToBeOptional>>;

type FullyOptionalType<R extends UnknownShape> = Readonly<{
  [P in keyof R]: OptionalPropertyType<R[P]>;
}>;

type PartiallyOptionalType<
  R extends UnknownShape,
  K extends keyof R,
> = Readonly<{
  [P in keyof R]: P extends K ? OptionalPropertyType<R[P]> : R[P];
}>;

export type PartialType<
  R extends UnknownShape,
  KeysToBeOptional extends NonEmptyArray<keyof R & string> | undefined,
  ExcessValidation extends ExcessPropertyBehavior = 'strip',
> = RecordType<PartialTypeShape<R, KeysToBeOptional>, ExcessValidation>;

expectType<
  PartialTypeShape<
    Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
    readonly ['a']
  >,
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
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
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
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  PartialType<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>, readonly ['a']>,
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
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  PartialType<
    Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
    readonly ['a', 'b']
  >,
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
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  PartialType<Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>, undefined>,
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
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  PartialType<
    Readonly<{ a: Type<0>; b: Type<1>; c: Type<2> }>,
    // @ts-expect-error key "d" doesn't exist
    readonly ['a', 'd']
  >,
  0
>('!=');
