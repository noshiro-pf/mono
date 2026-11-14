import {
  Arr,
  expectType,
  hasKey,
  isRecord,
  memoizeFunction,
  Optional,
  Result,
} from 'ts-data-forge';
import type { ArrayElement, NonEmptyTuple, StrictPick } from 'ts-type-forge';
import {
  flattenShapeStructure,
  recordViewOf,
  tupleElementTypesOf,
  type Type,
  type TypeOf,
  unionMembersOf,
  type UnknownType,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  runtimeTypeNameOf,
  toUnionString,
  UNION_MEMBER_LISTING_MAX_LENGTH,
  type ValidationError,
} from '../utils/index.mjs';

/**
 * Creates a `Type` for a value that is of at least one of `types`.
 *
 * How each operation picks a member:
 *
 * - `is` / `validate` accept a value that any member accepts.
 * - `prune` prunes with the first member, in declaration order (a directly
 *   nested union contributing its members in place), whose `is` accepts the
 *   value. When members overlap — one accepts every value of another, such as
 *   a record without `excessProperty: 'reject'` and the same record with an
 *   extra key — the result therefore depends on the order: `union([point2d,
 *   point3d]).prune({ x, y, z })` drops `z`, and `union([point3d, point2d])`
 *   keeps it. Put the more specific member first.
 * - `fill` returns a value that is already a member as it is, and otherwise
 *   repairs it with `defaultType`, or the first member when none is given. A
 *   member's own repair rules, such as `array`'s `onInvalidElement: 'drop'`,
 *   therefore apply to a non-member value only through that default source,
 *   and inside an element type they apply as usual.
 */
export const union = <const Types extends NonEmptyTuple<UnknownType>>(
  types: Types,
  options?: Partial<
    Readonly<{
      typeName: string;
      defaultType: UnionType<Types>;
    }>
  >,
): UnionType<Types> => {
  type T = UnionTypeValue<Types>;

  /**
   * Where `fill` and `defaultValue` come from when the value is not a member of
   * the union: the explicit `defaultType`, else the first member.
   *
   * Deferred like every other default-value source in the package, and
   * deliberately so although nothing here needs it: both operands exist by the
   * time `union` is called, so this one would hold a plain `const`. The types
   * whose default is built from *another* type's cannot — `record` reads each
   * member's `defaultValue`, `tuple` and the length-constrained arrays read the
   * element's, `recursion` calls the definition — and for a type defined in
   * terms of itself, forcing that at construction does not terminate. One shape
   * across all of them is easier to trust than a
   * per-constructor judgement about which reads are safe to make eager.
   *
   * Only `defaultValue` and `fill` are ever read, and both are covariant in the
   * value type, so the assertion widens rather than lies — the first member's
   * default value *is* one of the union's values. The compiler cannot see that:
   * `types[0]` resolves against the bound
   * `readonly [UnknownType, ...UnknownType[]]`, so which member it is has
   * already been erased to `Type<unknown>` here.
   *
   * Asserting the whole `UnionType<Types>` instead would be unsound, because
   * that also promises `is` and `prune`, and the first member answers both only
   * for its own values.
   */
  type DefaultSource = StrictPick<Type<T>, 'defaultValue' | 'fill'>;

  const getDefaultSource = memoizeFunction(
    (): DefaultSource =>
      options?.defaultType ??
      // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
      (types[0] as DefaultSource),
  );

  const typeNameFilled: string =
    options?.typeName ?? `(${toUnionString(types.map((a) => a.typeName))})`;

  /**
   * A union nested directly inside this one contributes its own members instead
   * of itself. `A | (B | C)` and `A | B | C` describe the same set of values,
   * so this changes nothing about what the union accepts.
   *
   * It was introduced for the error path. Reporting the member closest to a
   * rejected value starts by filing each member under a single runtime type
   * category, taken from its default value — and a nested union has only one
   * default value. Unflattened, `union([union([literal('alpha'), literal(42)]),
   * ...])` is filed under `string`, so validating `41` finds no candidate at
   * all and the union falls back to listing the categories it accepts.
   * Flattened, the `42` member competes on its own and is reported.
   *
   * Two things deliberately stay unflattened: `typeName` and the member listing
   * use the members as they were written, so a nested union that carries a name
   * of its own keeps it; and a `recursion` member's `structure` is a
   * `recursion`, read without running its definition, so a type defined in
   * terms of itself stays a single opaque member.
   *
   * See `documents/union-closest-member-heuristic.md`.
   */
  const memberTypes: readonly UnknownType[] = types.flatMap(unionMembersOf);

  // Not derived from `validate`, whose failure path validates the members once
  // more to build its report; a rejected value would pay for that at every
  // level of nesting.
  const is = (a: unknown): a is T => memberTypes.some((t) => t.is(a));

  const memberTypeNames = types.map((t) => t.typeName);

  // A listing short enough to print is the default report. It is not the best
  // one when the value stands out as a near-miss of a single member — which is
  // common once the members carry names, since names are what make a listing
  // short — so the closest member is looked for either way.
  const isListable =
    toUnionString(memberTypeNames).length <= UNION_MEMBER_LISTING_MAX_LENGTH;

  // A nested union is listed under its own name, which the closest member would
  // replace with one of its members'.
  const hasNestedUnion = types.some((t) => t.structure?.kind === 'union');

  const validate: Type<T>['validate'] = (a) => {
    if (is(a)) {
      return Result.ok(a);
    }

    const header = {
      path: [],
      actualValue: a,
      expectedType: typeNameFilled,
      typeName: typeNameFilled,
    } as const;

    const listingError = {
      ...header,
      details: {
        kind: 'union',
        typeNames: memberTypeNames,
      },
    } as const satisfies ValidationError;

    if (isListable && hasNestedUnion) {
      return Result.err([listingError]);
    }

    // Narrow the report down to the members whose runtime type category
    // (derived from each member's default value) matches the value.
    const actualCategory = runtimeTypeNameOf(a);

    const candidateTypes = memberTypes.filter(
      (t) => runtimeTypeNameOf(t.defaultValue) === actualCategory,
    );

    // Only a record or a tuple can stand out (see below), so without one the
    // listing is known without validating the members again.
    if (
      isListable &&
      candidateTypes.every((t) => checkedKeysOf(t) === undefined)
    ) {
      return Result.err([listingError]);
    }

    const candidates = candidateTypes.map((t) => evaluateMember(t, a));

    if (!Arr.isNonEmpty(candidates)) {
      return Result.err([
        {
          ...header,
          details: {
            kind: 'union-category-mismatch',
            memberCount: memberTypes.length,
            memberCategories: Arr.uniq(
              memberTypes.map((t) => runtimeTypeNameOf(t.defaultValue)),
            ),
          },
        } satisfies ValidationError,
      ]);
    }

    // The closest member is the one with the lowest similarity score (see
    // `evaluateMember`); its errors explain the mismatch far better than the
    // full member listing would. Members that tie with it are named alongside
    // it, and the first of them (in declaration order, as in `prune` and
    // `fill`) is the one whose errors are reported.
    const closest = Optional.unwrap(
      Arr.minBy(candidates, (candidate) => candidate, compareByCloseness),
    );

    const equallyClose = candidates.filter(
      (c) => c !== closest && compareByCloseness(c, closest) === 0,
    );

    // When the listing can be printed, the closest member replaces it only if
    // it stands out: no other member is as close, and the value has at least
    // one key the member checks and accepts. Otherwise the listing says more
    // than any one member would.
    if (
      isListable &&
      (Arr.isNonEmpty(equallyClose) || acceptedKeyCountOf(closest, a) === 0)
    ) {
      return Result.err([listingError]);
    }

    return Result.err(
      Arr.toUnshifted({
        ...header,
        details: {
          kind: 'union-closest-member',
          memberCount: memberTypes.length,
          closestMemberTypeName: closest.typeName,
          equallyCloseMemberTypeNames: equallyClose.map((c) => c.typeName),
        },
      } satisfies ValidationError)(closest.errors),
    );
  };

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : getDefaultSource().fill(a));

  // Prunes with the first member type that matches the value.
  const prune = (a: T): T => {
    const matched = memberTypes.find((t) => t.is(a));

    return matched === undefined
      ? a
      : // A member of the union prunes to a member of the union.
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
        (matched.prune(a) as T);
  };

  const baseType = {
    typeName: typeNameFilled,
    get defaultValue() {
      return getDefaultSource().defaultValue;
    },
    fill,
    prune,
    validate,
    is,
    assertIs: createAssertFn(validate),
    cast: createCastFn(validate),
    structure: { kind: 'union', memberTypes: types },
  } as const satisfies Type<T>;

  return baseType as UnionType<Types>;
};

/**
 * How close a member is to a value it rejected.
 *
 * `score` is the number of checks the member failed minus the number it passed,
 * so a member is credited for what the value does satisfy. Plain error counting
 * would let a small unrelated member (one missing key) outrank a large member
 * the value nearly satisfies (two wrong fields out of ten), while a ratio would
 * do the opposite and let a large member win with a long list of errors just
 * because it also has many keys. Subtracting keeps both the failed and the
 * passed checks in absolute terms.
 *
 * Members with the same score are ordered by how much they satisfied, so the
 * one that recognized more of the value comes first.
 *
 * See `documents/union-closest-member-heuristic.md` for the scenarios these
 * rules were chosen against.
 */
type MemberCloseness = Readonly<{
  memberType: UnknownType;
  typeName: string;
  errors: readonly ValidationError[];
  satisfiedCheckCount: number;
  score: number;
}>;

/**
 * The keys of a record, or the indices of a tuple, that a member checks one by
 * one; `undefined` for a member that checks the value as a whole.
 */
const checkedKeysOf = (
  memberType: UnknownType,
): readonly string[] | undefined => {
  const view = recordViewOf(memberType);

  if (view !== undefined) {
    const shape = flattenShapeStructure(view.shapeStructure);

    return shape === undefined ? undefined : Object.keys(shape);
  }

  return tupleElementTypesOf(memberType)?.map((_, index) => index.toString());
};

/**
 * How many checks a member performs on a value: one per key for a record, one
 * per element for a tuple, and a single check for everything else, which either
 * matches or does not. A record whose shape cannot be flattened to a single set
 * of keys (a union of shapes) also counts as one check.
 */
const checkCountOf = (memberType: UnknownType): number =>
  checkedKeysOf(memberType)?.length ?? 1;

/** The value under a record key or a tuple index, if `a` has one. */
const valueAt = (a: unknown, key: string): unknown =>
  Arr.isArray(a)
    ? a.find((_, index) => index.toString() === key)
    : isRecord(a) && hasKey(a, key)
      ? a[key]
      : undefined;

/**
 * How many of the keys a member checks are present in the value and accepted.
 *
 * Unlike `satisfiedCheckCount`, this does not credit an optional key the value
 * leaves out (or sets to `undefined`), nor count a key as failed twice because
 * it reported two errors beneath it, so it tells whether the value resembles
 * the member at all. An error about the value as a whole, such as a tuple of
 * the wrong length, means the member checked no key of it.
 */
const acceptedKeyCountOf = (closeness: MemberCloseness, a: unknown): number => {
  const keys = checkedKeysOf(closeness.memberType);

  if (
    keys === undefined ||
    closeness.errors.some((e) => !Arr.isNonEmpty(e.path))
  ) {
    return 0;
  }

  return keys.filter(
    (key) =>
      valueAt(a, key) !== undefined &&
      closeness.errors.every((e) => e.path[0] !== key),
  ).length;
};

const validationErrorsOf = (
  result: Result<unknown, readonly ValidationError[]>,
): readonly ValidationError[] =>
  Result.isErr(result) ? result.value : ([] as const);

const evaluateMember = (
  memberType: UnknownType,
  a: unknown,
): MemberCloseness => {
  const errors = validationErrorsOf(memberType.validate(a));

  // A member cannot pass fewer than zero checks: a record that rejects excess
  // properties can report more errors than it has keys.
  const satisfiedCheckCount = Math.max(
    0,
    checkCountOf(memberType) - errors.length,
  );

  return {
    memberType,
    typeName: memberType.typeName,
    errors,
    satisfiedCheckCount,
    score: errors.length - satisfiedCheckCount,
  };
};

const compareByCloseness = (x: MemberCloseness, y: MemberCloseness): number =>
  x.score !== y.score
    ? x.score - y.score
    : y.satisfiedCheckCount - x.satisfiedCheckCount;

/**
 * @internal The `Type` `union` returns, computed from the arguments; a consumer
 * spells `ReturnType<typeof union<…>>`.
 */
type UnionType<Types extends NonEmptyTuple<UnknownType>> = Type<
  UnionTypeValue<Types>
>;

type UnionTypeValue<Types extends NonEmptyTuple<UnknownType>> =
  TsFortressInternal.UnionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type UnionTypeValueImpl<Types extends NonEmptyTuple<UnknownType>> =
    UnwrapUnion<ArrayElement<Types>>;

  type UnwrapUnion<T extends UnknownType> = T extends T ? TypeOf<T> : never;
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
