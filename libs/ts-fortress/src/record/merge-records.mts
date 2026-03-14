import { Arr, expectType, Obj } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import {
  type ExcessPropertyBehavior,
  type ExcessPropertyFillBehavior,
  type RecordType,
  type Type,
  type TypeOf,
  type UnknownShape,
} from '../type.mjs';
import { toIntersectionString } from '../utils/index.mjs';
import { record } from './record.mjs';

type UnknownRecordType = RecordType<UnknownShape, ExcessPropertyBehavior>;

export const mergeRecords = <
  const RecordTypes extends NonEmptyArray<UnknownRecordType>,
  const ExcessValidation extends ExcessPropertyBehavior = 'strip',
>(
  recordTypes: RecordTypes,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultValue: IntersectionTypeValue<RecordTypes>;

      /**
       * Behavior when validating objects with excess properties.
       * - 'allow': Accept excess properties
       * - 'strip': Remove excess properties from the result (default)
       * - 'error': Reject objects with excess properties
       * @default 'strip'
       */
      excessPropertyValidation: ExcessValidation;

      /**
       * Behavior when filling objects with excess properties.
       * - 'allow': Keep excess properties in the result
       * - 'strip': Remove excess properties from the result (default)
       * @default 'strip'
       */
      excessPropertyFill: ExcessPropertyFillBehavior;
    }>
  >,
): RecordType<
  TsFortressInternal.CastToShape<IntersectionOfTypeShape<RecordTypes>>,
  ExcessValidation
> => {
  type Ret = RecordType<
    TsFortressInternal.CastToShape<IntersectionOfTypeShape<RecordTypes>>,
    ExcessValidation
  >;

  const typeNameFilled: string =
    options?.typeName ??
    `(${toIntersectionString(recordTypes.map((a) => a.typeName))})`;

  const shapes = Arr.map(recordTypes, (t) => t.shape);

  const mergedShape = Obj.merge(...shapes);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return record(mergedShape as UnknownShape, {
    typeName: typeNameFilled,
    excessPropertyValidation: options?.excessPropertyValidation,
    excessPropertyFill: options?.excessPropertyFill,
  }) as unknown as Ret;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type IntersectionTypeValue<Types extends NonEmptyArray<UnknownRecordType>> =
  Intersection<TsFortressInternal.TypeListToValueTypeList<Types>>;

type IntersectionOfTypeShape<Types extends NonEmptyArray<UnknownRecordType>> =
  Intersection<TsFortressInternal.TypeListToShapeList<Types>>;

namespace TsFortressInternal {
  export type TypeListToValueTypeList<
    Types extends readonly UnknownRecordType[],
  > = TypeListToValueTypeListImpl<Types>;

  type TypeListToValueTypeListImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? readonly []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [TypeOf<Cast1<Head>>, ...TypeListToValueTypeListImpl<Tail>]
        : never;

  // transformer-ignore-next-line
  type Cast1<T> = [T] extends [UnknownRecordType] ? T : never;

  export type TypeListToShapeList<Types extends readonly UnknownRecordType[]> =
    TypeListToShapeListImpl<Types>;

  type TypeListToShapeListImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? readonly []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [GetShape<Head>, ...TypeListToShapeListImpl<Tail>]
        : never;

  // transformer-ignore-next-line
  type GetShape<T> = [T] extends [UnknownRecordType] ? T['shape'] : never;

  // transformer-ignore-next-line
  export type CastToShape<T> = [T] extends [UnknownShape] ? T : never;
}

expectType<
  IntersectionTypeValue<
    readonly [
      RecordType<
        Readonly<{
          a: Type<0>;
          b: Type<0>;
        }>
      >,
      RecordType<
        Readonly<{
          b: Type<0>;
          c: Type<0>;
        }>
      >,
    ]
  >,
  Readonly<{
    a: 0;
    b: 0;
    c: 0;
  }>
>('=');

expectType<
  IntersectionOfTypeShape<
    readonly [
      RecordType<
        Readonly<{
          a: Type<0>;
          b: Type<0>;
        }>
      >,
      RecordType<
        Readonly<{
          b: Type<0>;
          c: Type<0>;
        }>
      >,
    ]
  >,
  Readonly<{
    a: Type<0>;
    b: Type<0>;
    c: Type<0>;
  }>
>('=');

expectType<
  IntersectionOfTypeShape<
    readonly [
      RecordType<
        Readonly<{
          a: Type<0>;
          b: Type<0>;
        }>
      >,
      RecordType<
        Readonly<{
          b: Type<0>;
          c: Type<0>;
        }>
      >,
    ]
  >,
  UnknownShape
>('<=');

expectType<
  RecordType<
    IntersectionOfTypeShape<
      [
        RecordType<
          Readonly<{
            a: Type<0>;
            b: Type<0>;
          }>
        >,
        RecordType<
          Readonly<{
            b: Type<0>;
            c: Type<0>;
          }>
        >,
      ]
    >
  >['shape'],
  Readonly<{
    a: Type<0>;
    b: Type<0>;
    c: Type<0>;
  }>
>('=');

expectType<
  IntersectionOfTypeShape<NonEmptyArray<UnknownRecordType>>,
  UnknownShape
>('<=');

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
  TsFortressInternal.TypeListToValueTypeList<
    readonly [
      RecordType<
        Readonly<{
          a: Type<0>;
          b: Type<0>;
        }>
      >,
      RecordType<
        Readonly<{
          b: Type<0>;
          c: Type<0>;
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

if (import.meta.vitest !== undefined) {
  test('Obj.merge for shapes', () => {
    const _m1 = Obj.merge(
      { a: literal(0), b: literal(0) },
      { c: literal(0), d: literal(0) },
    );

    expectType<
      typeof _m1,
      Readonly<{
        a: Type<0>;
        b: Type<0>;
        c: Type<0>;
        d: Type<0>;
      }>
    >('=');

    const _m2 = Obj.merge(
      { a: literal(0), b: literal(0) },
      { b: literal(0), c: literal(0) },
    );

    expectType<
      typeof _m2,
      Readonly<{
        a: Type<0>;
        b: Type<0>;
        c: Type<0>;
      }>
    >('=');

    assert.isTrue(true); // dummy assertion to avoid "Test has no assertions" error
  });
}
