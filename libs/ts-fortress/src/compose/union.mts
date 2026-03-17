import { Arr, Obj, Result, expectType, memoizeFunction } from 'ts-data-forge';
import {
  hasRecordInternals,
  type ExcessPropertyOption,
  type RecordTypeInternals,
  type Type,
  type TypeOf,
  type UnknownShape,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  toUnionString,
  type ValidationError,
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

  const getDefaultType = memoizeFunction(
    (): UnionType<Types> =>
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      options?.defaultType ?? (types[0] as UnionType<Types>),
  );

  const typeNameFilled: string =
    options?.typeName ?? `(${toUnionString(types.map((a) => a.typeName))})`;

  const validate: Type<T>['validate'] = (a) =>
    types.some((t) => t.is(a))
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        Result.ok(a as T)
      : Result.err([
          {
            path: [],
            actualValue: a,
            expectedType: typeNameFilled,
            typeName: typeNameFilled,
            details: {
              kind: 'union',
              typeNames: types.map((t) => t.typeName),
            },
          } satisfies ValidationError,
        ]);

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : getDefaultType().fill(a));

  const baseType: Type<T> = {
    typeName: typeNameFilled,
    get defaultValue() {
      return getDefaultType().defaultValue;
    },
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

    // For union, merge all shapes to get all possible keys

    const mergedShape = Obj.merge(...shapes) as UnknownShape;

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
    } as UnionType<Types>;
  }

  return baseType as UnionType<Types>;
};

type UnionType<Types extends NonEmptyArray<Type<unknown>>> = Type<
  UnionTypeValue<Types>
>;

type UnionTypeValue<Types extends NonEmptyArray<Type<unknown>>> =
  TsFortressInternal.UnionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type UnionTypeValueImpl<Types extends NonEmptyArray<Type<unknown>>> =
    UnwrapUnion<ArrayElement<Types>>;

  type UnwrapUnion<T extends Type<unknown>> = T extends T ? TypeOf<T> : never;
}

expectType<
  UnionType<
    readonly [Type<Readonly<{ a: 0; b: 0 }>>, Type<Readonly<{ b: 0; c: 0 }>>]
  >,
  Type<Readonly<{ a: 0; b: 0 } | { b: 0; c: 0 }>>
>('=');

expectType<
  UnionType<
    readonly [
      Type<Readonly<{ a: 0; b: 0 }>>,
      Type<Readonly<{ b: 0; c: 0 }>>,
      Type<Readonly<{ e: 0; f: 0 }>>,
    ]
  >,
  Type<Readonly<{ a: 0; b: 0 } | { b: 0; c: 0 } | { e: 0; f: 0 }>>
>('=');
