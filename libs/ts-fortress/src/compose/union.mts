import { Arr, Result, expectType, memoizeFunction } from 'ts-data-forge';
import { type ArrayElement, type NonEmptyArray } from 'ts-type-forge';
import {
  hasRecordInternals,
  type AnyType,
  type ExcessPropertyOption,
  type Type,
  type TypeOf,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  toUnionString,
  type ValidationError,
} from '../utils/index.mjs';

export const union = <const Types extends NonEmptyArray<AnyType>>(
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

  // Prunes with the first member type that matches the value.
  const prune = (a: T): T => {
    const matched = types.find((t) => t.is(a));

    return matched === undefined
      ? a
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (matched.prune(a) as T);
  };

  const baseType: Type<T> = {
    typeName: typeNameFilled,
    get defaultValue() {
      return getDefaultType().defaultValue;
    },
    fill,
    prune,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  } as const;

  // If all types are records, add RecordTypeInternals with union structure
  if (types.every(hasRecordInternals)) {
    const shapeStructures = Arr.map(types, (t) => t.shapeStructure);

    const excessProperty: ExcessPropertyOption = Arr.some(
      types,
      (t) => t.excessProperty === 'reject',
    )
      ? 'reject'
      : 'allow';

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return {
      ...baseType,
      shapeStructure: Arr.isFixedLengthTuple(shapeStructures, 1)
        ? shapeStructures[0]
        : ({ kind: 'union', variants: shapeStructures } as const),
      excessProperty,
    } as UnionType<Types>;
  }

  return baseType;
};

type UnionType<Types extends NonEmptyArray<AnyType>> = Type<
  UnionTypeValue<Types>
>;

type UnionTypeValue<Types extends NonEmptyArray<AnyType>> =
  TsFortressInternal.UnionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type UnionTypeValueImpl<Types extends NonEmptyArray<AnyType>> =
    UnwrapUnion<ArrayElement<Types>>;

  type UnwrapUnion<T extends AnyType> = T extends T ? TypeOf<T> : never;
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
