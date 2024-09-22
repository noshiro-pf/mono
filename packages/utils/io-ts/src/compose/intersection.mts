import { expectType, Result } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
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
    for (const type of types) {
      const r = type.validate(a);

      if (Result.isErr(r))
        return Result.err([
          validationErrorMessage(
            a,
            `The type of value is expected to match all types of { ${types
              .map((t) => t.typeName)
              .join(', ')} }`,
          ),
          ...r.value,
        ]);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
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
  IoTsInternal.IntersectionTypeValueImpl<Types>;

namespace IoTsInternal {
  export type IntersectionTypeValueImpl<
    Types extends NonEmptyArray<Type<unknown>>,
  > = Intersection<Cast0<UnwrapTypeList<Types>>>;

  type Cast0<T> = [T] extends [NonEmptyArray<unknown>] ? T : never;
}

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    expect(0).toBe(0);
  });

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
}

type UnwrapTypeList<Types extends readonly Type<unknown>[]> =
  IoTsInternal.UnwrapTypeImpl<Types>;

namespace IoTsInternal {
  export type UnwrapTypeImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [TypeOf<Cast1<Head>>, ...UnwrapTypeImpl<Tail>]
        : never;

  type Cast1<T> = [T] extends [Type<unknown>] ? T : never;
}

if (import.meta.vitest !== undefined) {
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
}

if (import.meta.vitest !== undefined) {
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
}
