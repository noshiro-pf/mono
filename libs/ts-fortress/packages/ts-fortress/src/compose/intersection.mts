import { Arr, expectType, hasKey, isRecord, Result, tp } from 'ts-data-forge';
import { type Intersection, type NonEmptyTuple } from 'ts-type-forge';
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
  toIntersectionString,
  type ValidationError,
} from '../utils/index.mjs';

export const intersection = <const Types extends NonEmptyTuple<AnyType>>(
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
    // Non-record intersections (e.g. branded primitives) have no excess paths
    // to remove. Record intersections override this below.
    prune: (a) => a,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
  } as const;

  // If all types are records, add RecordTypeInternals
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
      // A value path is represented by a record intersection if it is
      // represented by any member, so the pruned members are merged (deeply;
      // see `mergePruned`). All members are record types here
      // (`hasRecordInternals`), so each pruned result is a record.
      prune: (a: T): T =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-return
        types.map((t) => t.prune(a)).reduce(mergePruned, {}) as T,
      shapeStructure: Arr.isFixedLengthTuple(1, shapeStructures)
        ? shapeStructures[0]
        : ({ kind: 'intersection', parts: shapeStructures } as const),
      excessProperty,
    } as IntersectionType<Types>;
  }

  return baseType;
};

/**
 * Deep-merges the pruned results of intersection members. Each pruned result
 * contains only the value paths represented by its own member type, so the
 * results have to be merged recursively to keep the union of all represented
 * paths — a shallow spread would drop nested paths kept by an earlier member
 * whenever a later member shares the same key (e.g. two members both having a
 * `pos` sub-record with different fields).
 */
const mergePruned = (x: unknown, y: unknown): unknown => {
  if (isRecord(x) && isRecord(y)) {
    const xMergedWithY = Object.fromEntries(
      Object.entries(x).map(([k, xv]) =>
        tp(k, hasKey(y, k) ? mergePruned(xv, y[k]) : xv),
      ),
    );

    const yOnly = Object.fromEntries(
      Object.entries(y).filter(([k]) => !hasKey(x, k)),
    );

    return { ...xMergedWithY, ...yOnly };
  }

  // Both members pruned the same input array, so the lengths always match;
  // merge element-wise to keep every represented element path.
  if (Arr.isArray(x) && Arr.isArray(y) && x.length === y.length) {
    return x.map((xi, i) => mergePruned(xi, y[i]));
  }

  // Not structurally mergeable — the later member wins.
  return y;
};

type IntersectionType<Types extends NonEmptyTuple<AnyType>> = Type<
  IntersectionTypeValue<Types>
>;

type IntersectionTypeValue<Types extends NonEmptyTuple<AnyType>> =
  TsFortressInternal.IntersectionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type IntersectionTypeValueImpl<Types extends NonEmptyTuple<AnyType>> =
    Intersection<Cast0<UnwrapTypeList<Types>>>;

  type Cast0<T> = readonly [T] extends readonly [NonEmptyTuple<unknown>]
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

type UnwrapTypeList<Types extends readonly AnyType[]> =
  TsFortressInternal.UnwrapTypeImpl<Types>;

namespace TsFortressInternal {
  export type UnwrapTypeImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? readonly []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [TypeOf<Cast1<Head>>, ...UnwrapTypeImpl<Tail>]
        : never;

  type Cast1<T> = [T] extends [AnyType] ? T : never;
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
