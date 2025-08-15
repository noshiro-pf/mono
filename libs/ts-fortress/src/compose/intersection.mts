import { Arr, expectType, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  type ValidationError,
  type ValidationErrorWithMessage,
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
    `Intersection<${types.map((a) => a.typeName).join(', ')}>`;

  const validate: Type<T>['validate'] = (a) => {
    const errors: readonly ValidationError[] = Arr.generate(function* () {
      for (const type of types) {
        const res = type.validate(a);

        if (Result.isErr(res)) {
          yield {
            path: [],
            actualValue: a,
            expectedType: typeNameFilled,
            message: `The type of value is expected to match all types of { ${types
              .map((t) => t.typeName)
              .join(', ')} }`,
            typeName: typeNameFilled,
          } satisfies ValidationErrorWithMessage;

          yield* res.value;
        }
      }
    });

    if (errors.length > 0) {
      return Result.err(errors);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Result.ok(a as T);
  };

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultType.fill(a));

  return {
    typeName: typeNameFilled,
    defaultValue: defaultType.defaultValue,
    fill,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  };
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

  type Cast0<T> = [T] extends [NonEmptyArray<unknown>] ? T : never;
}

expectType<
  IntersectionType<
    [
      Type<{
        a: 0;
        b: 0;
      }>,
      Type<{
        b: 0;
        c: 0;
      }>,
    ]
  >,
  Type<{
    a: 0;
    b: 0;
    c: 0;
  }>
>('=');

type UnwrapTypeList<Types extends readonly Type<unknown>[]> =
  TsFortressInternal.UnwrapTypeImpl<Types>;

namespace TsFortressInternal {
  export type UnwrapTypeImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [TypeOf<Cast1<Head>>, ...UnwrapTypeImpl<Tail>]
        : never;

  type Cast1<T> = [T] extends [Type<unknown>] ? T : never;
}

expectType<
  TypeOf<
    Type<{
      a: 0;
      b: 0;
    }>
  >,
  {
    a: 0;
    b: 0;
  }
>('=');

expectType<
  UnwrapTypeList<
    [
      Type<{
        a: 0;
        b: 0;
      }>,
      Type<{
        b: 0;
        c: 0;
      }>,
    ]
  >,
  readonly [
    {
      a: 0;
      b: 0;
    },
    {
      b: 0;
      c: 0;
    },
  ]
>('=');

expectType<
  Intersection<
    [
      {
        a: 0;
        b: 0;
      },
      {
        b: 0;
        c: 0;
      },
    ]
  >,
  {
    a: 0;
    b: 0;
    c: 0;
  }
>('=');

expectType<
  Intersection<
    [
      {
        a: 0;
        b: 0;
      },
      {
        b: 0;
        c: 0;
      },
      {
        c: 0;
        d: 0;
      },
    ]
  >,
  {
    a: 0;
    b: 0;
    c: 0;
    d: 0;
  }
>('=');

expectType<
  Intersection<
    [
      {
        a: 0;
        b: 0;
      },
      {
        b: 1;
        c: 0;
      },
    ]
  >,
  never
>('=');
