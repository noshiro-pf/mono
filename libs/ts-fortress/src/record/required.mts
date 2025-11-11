import { expectType, Obj } from 'ts-data-forge';
import {
  type ExcessPropertyBehavior,
  type RecordType,
  type Type,
} from '../type.mjs';
import { toUnionKeyString } from '../utils/index.mjs';
import {
  isOptionalProperty,
  type OptionalPropertyType,
  type RequiredPropertyType,
} from './optional.mjs';
import { record } from './record.mjs';

/**
 * Creates a Required type. If keysToBeRequired is set, only those keys are
 * made required, otherwise, all properties are made required.
 */
export const required = <
  const R extends ReadonlyRecord<string, Type<unknown>>,
  const KeysToBeRequired extends NonEmptyArray<keyof R & string>,
  const ExcessValidation extends ExcessPropertyBehavior = 'strip',
>(
  recordType: RecordType<R, ExcessValidation>,
  options?: PartialReadonly<{
    keysToBeRequired: KeysToBeRequired;
    typeName: string;
    excessPropertyValidation: ExcessValidation;
    excessPropertyFill: Extract<ExcessPropertyBehavior, 'allow' | 'strip'>;
  }>,
): RequiredType<R, KeysToBeRequired, ExcessValidation> => {
  const typeNameFilled: string =
    options?.typeName ??
    (options?.keysToBeRequired === undefined
      ? `Required<${recordType.typeName}>`
      : `PartiallyRequired<${recordType.typeName}, ${toUnionKeyString(options.keysToBeRequired)}>`);

  const keysToBeRequired: ReadonlySet<string> = new Set(
    options?.keysToBeRequired ?? Object.keys(recordType.shape),
  );

  const requiredShape =
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Object.fromEntries(
      Object.entries(recordType.shape).map(
        ([k, v]) => [k, keysToBeRequired.has(k) ? makeRequired(v) : v] as const,
      ),
    ) satisfies ReadonlyRecord<string, Type<unknown>> as RequiredTypeShape<
      R,
      KeysToBeRequired
    >;

  return record(requiredShape, {
    typeName: typeNameFilled,
    excessPropertyValidation:
      options?.excessPropertyValidation ?? recordType.excessPropertyValidation,
    excessPropertyFill:
      options?.excessPropertyFill ?? recordType.excessPropertyFill,
  });
};

/**
 * Makes an optional property required by removing the optional flag.
 */
const makeRequired = <T extends Type<unknown>>(
  t: T,
): RequiredPropertyType<T> =>
  isOptionalProperty(t)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (Obj.omit(t, ['optional']) as RequiredPropertyType<T>)
    : t;

type RequiredTypeShape<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToBeRequired extends NonEmptyArray<keyof R & string> | undefined,
> =
  TypeEq<KeysToBeRequired, undefined> extends true
    ? FullyRequiredType<R>
    : PartiallyRequiredType<R, ArrayElement<KeysToBeRequired>>;

type FullyRequiredType<R extends ReadonlyRecord<string, Type<unknown>>> = {
  readonly [P in keyof R]: RequiredPropertyType<R[P]>;
};

type PartiallyRequiredType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  K extends keyof R,
> = {
  readonly [P in keyof R]: P extends K ? RequiredPropertyType<R[P]> : R[P];
};

export type RequiredType<
  R extends ReadonlyRecord<string, Type<unknown>>,
  KeysToBeRequired extends NonEmptyArray<keyof R & string> | undefined,
  ExcessValidation extends ExcessPropertyBehavior = 'strip',
> = RecordType<RequiredTypeShape<R, KeysToBeRequired>, ExcessValidation>;

expectType<
  RequiredTypeShape<
    {
      a: OptionalPropertyType<Type<0>>;
      b: Type<1>;
      c: OptionalPropertyType<Type<2>>;
    },
    ['a']
  >,
  Readonly<{
    a: Type<0>;
    b: Type<1>;
    c: OptionalPropertyType<Type<2>>;
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
      a: Type<0>;
      b: Type<1>;
      c: OptionalPropertyType<Type<2>>;
    }>
  >,
  Type<
    Readonly<{
      a: 0;
      b: 1;
      c?: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: Type<0>;
        b: Type<1>;
        c: OptionalPropertyType<Type<2>>;
      }>;
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  RequiredType<
    {
      a: OptionalPropertyType<Type<0>>;
      b: Type<1>;
      c: OptionalPropertyType<Type<2>>;
    },
    ['a']
  >,
  Type<
    Readonly<{
      a: 0;
      b: 1;
      c?: 2;
    }>
  > &
    Readonly<{
      shape: Readonly<{
        a: Type<0>;
        b: Type<1>;
        c: OptionalPropertyType<Type<2>>;
      }>;
      excessPropertyValidation: 'strip';
      excessPropertyFill: 'allow' | 'strip';
    }>
>('=');

expectType<
  RequiredType<
    {
      a: OptionalPropertyType<Type<0>>;
      b: OptionalPropertyType<Type<1>>;
      c: Type<2>;
    },
    ['a', 'b']
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
  RequiredType<
    {
      a: OptionalPropertyType<Type<0>>;
      b: OptionalPropertyType<Type<1>>;
      c: OptionalPropertyType<Type<2>>;
    },
    undefined
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
  RequiredType<
    {
      a: OptionalPropertyType<Type<0>>;
      b: Type<1>;
      c: OptionalPropertyType<Type<2>>;
    },
    // @ts-expect-error key "d" doesn't exist
    ['a', 'd']
  >,
  0
>('!=');
