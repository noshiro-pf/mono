import {
  Arr,
  expectType,
  hasKey,
  isRecord,
  memoizeFunction,
  Optional,
  Result,
  tp,
} from 'ts-data-forge';
import type { ArrayElement, NonEmptyTuple, StrictPick } from 'ts-type-forge';
import { isPlainObject } from '../deep-merge.mjs';
import {
  asType,
  flattenShapeStructure,
  recordViewOf,
  structureOf,
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
 * - `fill` returns a value that is already a member as it is. A union given a
 *   `defaultType` repairs any other value with it. Otherwise it repairs it
 *   with the only member of the value's runtime category where that is a
 *   record, whatever keys the value has; among several record or tuple members
 *   (and no member of the category that checks the value as a whole, such as
 *   an `array` or a `keyValueRecord`), with the one that keeps the most of the
 *   value's keys against those it does not keep, where it keeps one at least
 *   and no other is as close:
 *   `union([nullType, record({ x, y })]).fill({ x: 1 })` is `{ x: 1, y: 0 }`;
 *   and else with the first member. A member's own repair rules, such as
 *   `array`'s `onInvalidElement: 'drop'`, therefore apply to a non-member
 *   value only through the member that repairs it, and inside an element type
 *   they apply as usual.
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
   * Where `defaultValue` comes from, and `fill` for a value that is not a member
   * of the union and that no closest member repairs (see `closestRepairOf`):
   * the explicit `defaultType`, else the first member.
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
   * already been erased to the bound here.
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
    // it, and the first of them (in declaration order, as in `prune`) is the one
    // whose errors are reported.
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

  // A value no member accepts is repaired by the record or tuple member closest
  // to it (see `repairDistanceOf`) where no other member of the value's
  // category is as close, and by the only member of its category where that is
  // a record: a record that is missing a key is then repaired by the record
  // member rather than by a `null` declared first. A union given a
  // `defaultType` repairs with it, as it did before members were compared; so
  // does one where no member is a repair of the value, or two are as close.
  //
  // The members are sorted for each value rather than once for the union: a
  // `recursion` is resolved only when a value first needs it, and the sorting
  // costs about as much as the `is` checks that follow it.
  //
  // A member whose default does not terminate (two `recursion`s that default to
  // each other, of records or of tuples) cannot repair a value it is chosen
  // for, and its default is read here to sort it unless it is a record or a
  // tuple (a `recursion` of a tuple is not seen as one, and is read); this
  // union's `validate` already reads every member's default for the same value,
  // so such a schema fails there as it does here. The first member used to
  // repair it only by being declared first.
  const closestRepairOf = (a: unknown): UnknownType | undefined => {
    if (options?.defaultType !== undefined) {
      return undefined;
    }

    const isRecord_ = (t: UnknownType): boolean =>
      recordViewOf(t) !== undefined;

    const isTuple = (t: UnknownType): boolean =>
      tupleElementTypesOf(t) !== undefined;

    // Only a plain object can be repaired by a record, and only an array by a
    // tuple: a `Date` or another class instance is not a record of defaults.
    // A default is read only to find a member of the value's category that
    // checks it as a whole: none for a value of any other kind, nor a record's
    // or a tuple's, since a default may not terminate (two `recursion`s that
    // default to each other; a member with such a default fails `validate`,
    // which reads every member's default, and cannot repair a value either).
    const kinds = isPlainObject(a)
      ? tp(isRecord_, isTuple)
      : Arr.isArray(a)
        ? tp(isTuple, isRecord_)
        : undefined;

    if (kinds === undefined) {
      return undefined;
    }

    const [checksKeys, isOfTheOtherKind] = kinds;

    const actualCategory = runtimeTypeNameOf(a);

    // Once each: a member a nested union repeats is one member.
    const sameCategory = memberTypes.filter(
      (t, i) =>
        memberTypes.indexOf(t) === i &&
        (checksKeys(t) ||
          (!isOfTheOtherKind(t) &&
            runtimeTypeNameOf(t.defaultValue) === actualCategory)),
    );

    // The only member of the value's category, if a record, repairs it whatever
    // keys it has: a record that has none of its keys is still a record. Among
    // several, the value has to say which.
    if (
      Arr.isFixedLengthTuple(1, sameCategory) &&
      recordViewOf(sameCategory[0]) !== undefined
    ) {
      return sameCategory[0];
    }

    // A member that checks the value as a whole (a `keyValueRecord`, an
    // `array`, a `recursion` that is not a record, a `refine` or a `brand`,
    // which may reject what its base accepts) is not weighed key by key, so a
    // record that keeps one key cannot be told closer than it: the repair is
    // left to the default.
    if (sameCategory.some((t) => checkedKeysOf(t) === undefined)) {
      return undefined;
    }

    const candidates = Arr.generate(function* () {
      for (const t of sameCategory) {
        const d = repairDistanceOf(t, a);

        if (d !== undefined) {
          yield tp(t, d);
        }
      }
    });

    const closest = Arr.minBy(candidates, ([, d]) => d);

    if (Optional.isNone(closest)) {
      return undefined;
    }

    const [memberType, distance] = Optional.unwrap(closest);

    return candidates.every(([t, d]) => t === memberType || d !== distance)
      ? memberType
      : undefined;
  };

  // `is` of a value invalid deep in a `recursion` costs time exponential in its
  // depth (a `recursion`'s `is` validates, and a failing union's `validate`
  // validates its members again to name the closest), and repairing level by
  // level pays it at each level; cutting it to the first member paid it once.
  // Acceptable until `recursion`'s `is` stops going through `validate`.
  const fill: Type<T>['fill'] = (a) => {
    if (is(a)) {
      return a;
    }

    const closest = closestRepairOf(a);

    // A member of a union nested directly in this one is repaired by that union
    // (the first that holds it), which applies its own `defaultType`, or its
    // own closest member.
    const repairing =
      closest === undefined
        ? undefined
        : types.includes(closest)
          ? closest
          : (types.find((t) => unionMembersOf(t).includes(closest)) ?? closest);

    return repairing === undefined
      ? getDefaultSource().fill(a)
      : // A member of the union repairs to a member of the union.
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
        (repairing.fill(a) as T);
  };

  // Prunes with the first member type that matches the value.
  const prune = (a: T): T => {
    const matched = memberTypes.find((t) => t.is(a));

    return matched === undefined
      ? a
      : // A member of the union prunes to a member of the union.
        // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
        (asType(matched).prune(a) as T);
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
    structure: structureOf({ kind: 'union', memberTypes: types }),
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
 * For each key `a` has, whether `memberType` keeps it: whether it accepts what
 * is under it, and `false` for a key it does not declare, which a repair by it
 * drops or rejects, and none for a key holding `undefined`; `undefined` for a
 * member that checks `a` as a whole, or a tuple of another length.
 */
const keyVerdictsOf = (
  memberType: UnknownType,
  a: unknown,
): readonly boolean[] | undefined => {
  const view = recordViewOf(memberType);

  if (view !== undefined) {
    const shape = flattenShapeStructure(view.shapeStructure);

    if (shape === undefined || !isRecord(a)) {
      return undefined;
    }

    return Arr.generate(function* () {
      for (const [key, value] of Object.entries(a)) {
        // Own keys only: the value's keys may name an `Object.prototype` member
        // (`toString`, a parsed `__proto__`).
        // A key holding `undefined` speaks for no member, as a key left out.
        if (value === undefined) {
          continue;
        }

        const keyType = hasKey(shape, key) ? shape[key] : undefined;

        yield keyType?.is(value) ?? false;
      }
    });
  }

  const elementTypes = tupleElementTypesOf(memberType);

  return elementTypes === undefined ||
    !Arr.isArray(a) ||
    a.length !== elementTypes.length
    ? undefined
    : elementTypes.map((t, i) => t.is(a[i]));
};

/**
 * How far a member is from repairing a value it rejected, or `undefined` when
 * it is not a repair of it: the keys of the value the member does not keep
 * (rejects, or does not declare) minus those it keeps. Only the keys the value
 * has count, each by the member's own `is` of what is under it, so a key the
 * value leaves out (to be filled in, or an optional one) speaks for no member,
 * and a key wrong in several places counts once. A member that keeps none of
 * the value's keys has nothing of it to keep, and is not a repair; nor is a
 * tuple of another length.
 *
 * `validate` reports the closest member by its errors instead (see
 * `evaluateMember`), which tells the reader more and decides nothing; this
 * reads no errors, which would validate each member's part of the value again
 * on the way.
 */
const repairDistanceOf = (
  memberType: UnknownType,
  a: unknown,
): number | undefined => {
  const counts = keyVerdictsOf(memberType, a);

  if (counts === undefined) {
    return undefined;
  }

  const accepted = counts.filter((c) => c).length;

  return accepted === 0 ? undefined : counts.length - 2 * accepted;
};

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
