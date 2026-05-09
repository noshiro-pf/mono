import { Arr, expectType, Obj } from 'ts-data-forge';
import {
  type Intersection,
  type NonEmptyArray,
  type UnknownRecord,
} from 'ts-type-forge';
import { union } from '../compose/index.mjs';
import { literal } from '../other-types/index.mjs';
import {
  type ExcessPropertyOption,
  type RecordTypeInternals,
  type ShapeStructure,
  type Type,
  type TypeOf,
  type UnknownShape,
  hasRecordInternals,
} from '../type.mjs';
import { toIntersectionString } from '../utils/index.mjs';
import { record } from './record.mjs';

const MERGE_RECORDS_MAX_VARIANTS = 10_000;

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

  // Expand all shape structures to get all possible shape combinations
  const expandedShapesPerType = Arr.map(recordTypes, (t) =>
    expandShapeStructure(t.shapeStructure),
  );

  // Estimate the total number of merged variants that would be produced.
  // This is the product of the number of variants for each record type.
  const estimatedVariantCount = expandedShapesPerType.reduce(
    (acc, shapes) => acc * shapes.length,
    1,
  );

  if (estimatedVariantCount > MERGE_RECORDS_MAX_VARIANTS) {
    throw new Error(
      `mergeRecords would create ${estimatedVariantCount} record variants, exceeding the limit of ${MERGE_RECORDS_MAX_VARIANTS}. ` +
        'This could lead to excessive memory or CPU usage. Consider simplifying the record types or reducing union/intersection nesting.',
    );
  }

  // For merging records (which is an intersection operation),
  // we need to create the cartesian product of all variants
  // For example: {a} & ({b} | {c}) = ({a} & {b}) | ({a} & {c})
  const allCombinations = Arr.cartesianProduct(expandedShapesPerType);

  // Merge each combination
  const mergedShapes = Arr.map(allCombinations, (shapes) =>
    Obj.merge(...shapes),
  );

  const excessProperty =
    options?.excessProperty ?? deriveStrictestExcessProperty(recordTypes);

  // If there's only one merged shape, return it directly
  if (Arr.isArrayOfLength(mergedShapes, 1)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return record(mergedShapes[0], {
      typeName: typeNameFilled,
      excessProperty,
    }) as MergeRecordsType<Types>;
  }

  // If there are multiple variants, we need to return a union
  const variants = Arr.map(mergedShapes, (shape) =>
    record(shape, { excessProperty }),
  );

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return union(variants as NonEmptyArray<Type<UnknownRecord>>, {
    typeName: typeNameFilled,
  }) as MergeRecordsType<Types>;
};

/**
 * Expands a ShapeStructure into all possible simple shapes.
 * For union structures, returns an array of all variant shapes.
 * For intersection structures, computes cartesian product of all parts.
 */
const expandShapeStructure = (
  structure: ShapeStructure,
): readonly UnknownShape[] => {
  switch (structure.kind) {
    case 'simple': {
      return [structure.shape];
    }
    case 'union': {
      // Union: flatten all variants
      return structure.variants.flatMap(expandShapeStructure);
    }
    case 'intersection': {
      // Intersection: compute cartesian product of all parts
      const expandedParts = structure.parts.map(expandShapeStructure);

      const combinations = Arr.cartesianProduct(expandedParts);

      return Arr.map(combinations, (shapes) => Obj.merge(...shapes));
    }
  }
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
