import { Arr, expectType, Obj, Result } from 'ts-data-forge';
import {
  type ExcessPropertyOption,
  hasRecordInternals,
  type RecordTypeInternals,
  type Type,
  type TypeOf,
  type UnknownShape,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  toIntersectionString,
  type ValidationError,
} from '../utils/index.mjs';

export const intersection = <const Types extends NonEmptyArray<Type<unknown>>>(
  types: Types,
  defaultType: IntersectionType<Types>,
  options?: Partial<
    Readonly<{
      typeName: string;
    }>
  >,
): IntersectionType<Types> => {
  type T = IntersectionTypeValue<Types>;

  const typeNameFilled: string =
    options?.typeName ??
    `(${toIntersectionString(types.map((a) => a.typeName))})`;

  const validate: Type<T>['validate'] = (a) => {
    const errors: readonly ValidationError[] = Arr.generate(function* () {
      for (const type of types) {
        const res = type.validate(a);

        if (Result.isErr(res)) {
          yield {
            path: [],
            actualValue: a,
            expectedType: typeNameFilled,
            typeName: typeNameFilled,
            details: {
              kind: 'intersection',
              typeNames: types.map((t) => t.typeName),
            },
          } satisfies ValidationError;

          yield* res.value;
        }
      }
    });

    if (Arr.isNonEmpty(errors)) {
      return Result.err(errors);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultType.fill(a));

  const baseType: Type<T> = {
    typeName: typeNameFilled,
    defaultValue: defaultType.defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  } as const;

  // If all types are records, add RecordTypeInternals
  if (types.every(hasRecordInternals)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const recordTypes = types as unknown as NonEmptyArray<
      Type<unknown> & RecordTypeInternals
    >;

    const shapes = Arr.map(
      recordTypes,
      (t) => t.shape,
    ) satisfies readonly UnknownShape[];

    const mergedShape = Obj.merge(...shapes);

    const excessProperty: ExcessPropertyOption = recordTypes.some(
      (t) => t.excessProperty === 'reject',
    )
      ? 'reject'
      : 'allow';

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return {
      ...baseType,
      shape: mergedShape,
      excessProperty,
    } as IntersectionType<Types>;
  }

  return baseType as IntersectionType<Types>;
};

type IntersectionType<Types extends NonEmptyArray<Type<unknown>>> = Type<
  IntersectionTypeValue<Types>
>;

type IntersectionTypeValue<Types extends NonEmptyArray<Type<unknown>>> =
  TsFortressInternal.IntersectionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type IntersectionTypeValueImpl<
    Types extends NonEmptyArray<Type<unknown>>,
  > = Intersection<Cast0<UnwrapTypeList<Types>>>;

  type Cast0<T> = readonly [T] extends readonly [NonEmptyArray<unknown>]
    ? T
    : never;
}

expectType<
  IntersectionType<
    readonly [
      Type<
        Readonly<{
          a: 0;
          b: 0;
        }>
      >,
      Type<
        Readonly<{
          b: 0;
          c: 0;
        }>
      >,
    ]
  >,
  Type<
    Readonly<{
      a: 0;
      b: 0;
      c: 0;
    }>
  >
>('=');

type UnwrapTypeList<Types extends readonly Type<unknown>[]> =
  TsFortressInternal.UnwrapTypeImpl<Types>;

namespace TsFortressInternal {
  export type UnwrapTypeImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? readonly []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [TypeOf<Cast1<Head>>, ...UnwrapTypeImpl<Tail>]
        : never;

  // transformer-ignore-next-line
  type Cast1<T> = [T] extends [Type<unknown>] ? T : never;
}

expectType<
  TypeOf<
    Type<
      Readonly<{
        a: 0;
        b: 0;
      }>
    >
  >,
  Readonly<{
    a: 0;
    b: 0;
  }>
>('=');

expectType<
  UnwrapTypeList<
    readonly [
      Type<
        Readonly<{
          a: 0;
          b: 0;
        }>
      >,
      Type<
        Readonly<{
          b: 0;
          c: 0;
        }>
      >,
    ]
  >,
  readonly [
    Readonly<{
      a: 0;
      b: 0;
    }>,
    Readonly<{
      b: 0;
      c: 0;
    }>,
  ]
>('=');

expectType<
  Intersection<
    readonly [
      Readonly<{
        a: 0;
        b: 0;
      }>,
      Readonly<{
        b: 0;
        c: 0;
      }>,
    ]
  >,
  Readonly<{
    a: 0;
    b: 0;
    c: 0;
  }>
>('=');

expectType<
  Intersection<
    readonly [
      Readonly<{
        a: 0;
        b: 0;
      }>,
      Readonly<{
        b: 0;
        c: 0;
      }>,
      Readonly<{
        c: 0;
        d: 0;
      }>,
    ]
  >,
  Readonly<{
    a: 0;
    b: 0;
    c: 0;
    d: 0;
  }>
>('=');

expectType<
  Intersection<
    readonly [
      Readonly<{
        a: 0;
        b: 0;
      }>,
      Readonly<{
        b: 1;
        c: 0;
      }>,
    ]
  >,
  never
>('=');
