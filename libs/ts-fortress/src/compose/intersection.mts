import { Arr, expectType, memoizeFunction, Result } from 'ts-data-forge';
import type { Intersection, NonEmptyTuple } from 'ts-type-forge';
import { deepMerge } from '../deep-merge.mjs';
import {
  asType,
  recordViewOf,
  structureOf,
  type Type,
  type TypeOf,
  type UnknownType,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  toIntersectionString,
  type ValidationError,
} from '../utils/index.mjs';

export const intersection = <const Types extends NonEmptyTuple<UnknownType>>(
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

        if (!Result.isErr(res)) {
          continue;
        }

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
    });

    return Arr.isNonEmpty(errors)
      ? Result.err(errors)
      : // No errors, so the value is of the validated type.
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
        Result.ok(a as T);
  };

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : defaultType.fill(a));

  // Decided on first use rather than here: a member may be a `recursion` whose
  // definition refers to the binding this intersection initializes.
  const isRecordIntersection = memoizeFunction((): boolean =>
    types.every((t) => recordViewOf(t) !== undefined),
  );

  const prune: Type<T>['prune'] = (a) =>
    isRecordIntersection()
      ? // A value path is represented by a record intersection if it is
        // represented by any member, so the pruned members are merged (deeply;
        // see `deepMerge`). Every member is a record type here, so each pruned
        // result is a record.
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
        (types
          .map((t) => asType(t).prune(a))
          .reduce((acc, r) => deepMerge(a, acc, r), {}) as T)
      : // Non-record intersections (e.g. branded primitives) have no excess
        // paths to remove.
        a;

  const baseType: Type<T> = {
    typeName: typeNameFilled,
    // Read on first use rather than here, for the reason given at
    // `isRecordIntersection`: the default type may be a `recursion` too.
    get defaultValue() {
      return defaultType.defaultValue;
    },
    fill,
    prune,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
    structure: structureOf({ kind: 'intersection', memberTypes: types }),
  } as const;

  return baseType;
};

/**
 * @internal The `Type` `intersection` returns, computed from the arguments; a
 * consumer spells `ReturnType<typeof intersection<…>>`.
 */
type IntersectionType<Types extends NonEmptyTuple<UnknownType>> = Type<
  IntersectionTypeValue<Types>
>;

type IntersectionTypeValue<Types extends NonEmptyTuple<UnknownType>> =
  TsFortressInternal.IntersectionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type IntersectionTypeValueImpl<
    Types extends NonEmptyTuple<UnknownType>,
  > = Intersection<Cast0<UnwrapTypeList<Types>>>;

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

type UnwrapTypeList<Types extends readonly UnknownType[]> =
  TsFortressInternal.UnwrapTypeImpl<Types>;

namespace TsFortressInternal {
  export type UnwrapTypeImpl<Types extends readonly unknown[]> =
    Types extends readonly []
      ? readonly []
      : Types extends readonly [infer Head, ...infer Tail]
        ? readonly [TypeOf<Cast1<Head>>, ...UnwrapTypeImpl<Tail>]
        : never;

  type Cast1<T> = [T] extends [UnknownType] ? T : never;
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
