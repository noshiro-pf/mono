import { Result, expectType } from '@noshiro/ts-utils';
import { type Type, type TypeOf } from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  validationErrorMessage,
} from '../utils/index.mjs';

export const union = <const Types extends NonEmptyArray<Type<unknown>>>(
  types: Types,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultType: UnionType<Types>;
    }>
  >,
): UnionType<Types> => {
  type T = UnionTypeValue<Types>;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const defaultType = options?.defaultType ?? (types[0] as UnionType<Types>);

  const typeNameFilled: string =
    options?.typeName ?? `Union<${types.map((a) => a.typeName).join(', ')}>`;

  const validate: Type<T>['validate'] = (a) =>
    types.some((t) => t.is(a))
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(a as T)
      : Result.err([
          validationErrorMessage(
            a,
            `The type of value is expected to be one of the elements contained in { ${types
              .map((t) => t.typeName)
              .join(', ')} }`,
          ),
        ]);

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

type UnionType<Types extends NonEmptyArray<Type<unknown>>> = Type<
  UnionTypeValue<Types>
>;

type UnionTypeValue<Types extends NonEmptyArray<Type<unknown>>> =
  IoTsInternal.UnionTypeValueImpl<Types>;

namespace IoTsInternal {
  export type UnionTypeValueImpl<Types extends NonEmptyArray<Type<unknown>>> =
    UnwrapUnion<ArrayElement<Types>>;

  type UnwrapUnion<T extends Type<unknown>> = T extends T ? TypeOf<T> : never;
}

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    expect(0).toBe(0);
  });

  expectType<
    UnionType<[Type<{ a: 0; b: 0 }>, Type<{ b: 0; c: 0 }>]>,
    Type<{ a: 0; b: 0 } | { b: 0; c: 0 }>
  >('=');

  expectType<
    UnionType<
      [Type<{ a: 0; b: 0 }>, Type<{ b: 0; c: 0 }>, Type<{ e: 0; f: 0 }>]
    >,
    Type<{ a: 0; b: 0 } | { b: 0; c: 0 } | { e: 0; f: 0 }>
  >('=');
}
