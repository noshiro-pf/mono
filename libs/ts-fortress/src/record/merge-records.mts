import { Arr, expectType, Obj } from 'ts-data-forge';
import { literal } from '../other-types/index.mjs';
import {
  type ExcessPropertyOption,
  hasRecordInternals,
  type RecordTypeInternals,
  type Type,
  type TypeOf,
  type UnknownShape,
} from '../type.mjs';
import { toIntersectionString } from '../utils/index.mjs';
import { record } from './record.mjs';

export const mergeRecords = <
  const Types extends NonEmptyArray<Type<UnknownRecord>>,
>(
  recordTypes: Types,
  options?: Partial<
    Readonly<{
      typeName: string;
      excessProperty: ExcessPropertyOption;
    }>
  >,
): MergeRecordsType<Types> => {
  if (!recordTypes.every(hasRecordInternals)) {
    throw new Error(
      'Expected a record type but received a non-record type in mergeRecords',
    );
  }

  const typeNameFilled: string =
    options?.typeName ??
    `(${toIntersectionString(recordTypes.map((a) => a.typeName))})`;

  const shapes = Arr.map(
    recordTypes,
    (t) => t.shape,
  ) satisfies readonly UnknownShape[];

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const mergedShape = Obj.merge(...shapes) as UnknownShape;

  const excessProperty =
    options?.excessProperty ?? deriveStrictestExcessProperty(recordTypes);

  const internalRecord = record(mergedShape, {
    typeName: typeNameFilled,
    excessProperty,
  });

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return internalRecord as unknown as MergeRecordsType<Types>;
};

type MergeRecordsType<Types extends readonly Type<UnknownRecord>[]> = Type<
  MergedExactValue<Types>
>;

/** Compute the merged value type directly from input types' `defaultValue`. */
type MergedExactValue<Types extends readonly Type<UnknownRecord>[]> =
  FlattenIntersection<Intersection<ExactValueTuple<Types>>>;

/** Flatten an intersection result into a single mapped type for better TypeScript compatibility. */
type FlattenIntersection<T> = T extends UnknownRecord
  ? Readonly<{ [K in keyof T]: T[K] }>
  : T;

type ExactValueTuple<Types extends readonly unknown[]> =
  Types extends readonly [infer Head, ...infer Tail]
    ? readonly [ExactValueOf<Head>, ...ExactValueTuple<Tail>]
    : readonly [];

type ExactValueOf<T> =
  T extends Readonly<{ defaultValue: infer V }> ? V : never;

const deriveStrictestExcessProperty = (
  types: readonly RecordTypeInternals[],
): ExcessPropertyOption =>
  types.some((t) => t.excessProperty === 'reject') ? 'reject' : 'allow';

// Verify MergedExactValue flattens correctly
{
  type R1 = ReturnType<
    typeof record<Readonly<{ x: Type<number>; y: Type<number> }>>
  >;

  type R2 = ReturnType<
    typeof record<Readonly<{ z: Type<number>; w: Type<number> }>>
  >;

  expectType<
    MergedExactValue<readonly [R1, R2]>,
    Readonly<{ x: number; y: number; z: number; w: number }>
  >('=');
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
