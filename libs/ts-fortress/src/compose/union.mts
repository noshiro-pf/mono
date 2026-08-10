import { Arr, expectType, memoizeFunction, Result } from 'ts-data-forge';
import { type ArrayElement, type NonEmptyTuple } from 'ts-type-forge';
import {
  flattenShapeStructure,
  hasRecordInternals,
  hasTupleInternals,
  hasUnionInternals,
  type AnyType,
  type ExcessPropertyOption,
  type Type,
  type TypeOf,
  type UnionTypeInternals,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  runtimeTypeNameOf,
  toUnionString,
  UNION_MEMBER_LISTING_MAX_LENGTH,
  type ValidationError,
} from '../utils/index.mjs';

export const union = <const Types extends NonEmptyTuple<AnyType>>(
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

  /**
   * A union nested directly inside this one contributes its own members
   * instead of itself. `A | (B | C)` and `A | B | C` describe the same set of
   * values, so this changes nothing about what the union accepts.
   *
   * It was introduced for the error path. Reporting the member closest to a
   * rejected value starts by filing each member under a single runtime type
   * category, taken from its default value — and a nested union has only one
   * default value. Unflattened, `union([union([literal('alpha'), literal(42)]),
   * ...])` is filed under `string`, so validating `41` finds no candidate at
   * all and the union falls back to listing the categories it accepts.
   * Flattened, the `42` member competes on its own and is reported.
   *
   * Two things deliberately stay unflattened: `typeName` and the member
   * listing use the members as they were written, so a nested union that
   * carries a name of its own keeps it; and a `recursion` member answers
   * {@link hasUnionInternals} without running its definition, so a type
   * defined in terms of itself stays a single opaque member.
   *
   * See `documents/union-closest-member-heuristic.md`.
   */
  const memberTypes: readonly AnyType[] = types.flatMap((t) =>
    hasUnionInternals(t) ? t.memberTypes : [t],
  );

  const validate: Type<T>['validate'] = (a) => {
    if (memberTypes.some((t) => t.is(a))) {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Result.ok(a as T);
    }

    const memberTypeNames = types.map((t) => t.typeName);

    if (
      toUnionString(memberTypeNames).length <= UNION_MEMBER_LISTING_MAX_LENGTH
    ) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeNameFilled,
          typeName: typeNameFilled,
          details: {
            kind: 'union',
            typeNames: memberTypeNames,
          },
        } satisfies ValidationError,
      ]);
    }

    // The member listing is too long to be a readable error message, so
    // narrow the report down to the members whose runtime type category
    // (derived from each member's default value) matches the value.
    const actualCategory = runtimeTypeNameOf(a);

    const candidates = memberTypes
      .filter((t) => runtimeTypeNameOf(t.defaultValue) === actualCategory)
      .map((t) => evaluateMember(t, a));

    if (!Arr.isNonEmpty(candidates)) {
      return Result.err([
        {
          path: [],
          actualValue: a,
          expectedType: typeNameFilled,
          typeName: typeNameFilled,
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
    const closest = Arr.minBy(
      candidates,
      (candidate) => candidate,
      compareByCloseness,
    ).value;

    const equallyClose = candidates.filter(
      (c) => c !== closest && compareByCloseness(c, closest) === 0,
    );

    return Result.err(
      Arr.toUnshifted({
        path: [],
        actualValue: a,
        expectedType: typeNameFilled,
        typeName: typeNameFilled,
        details: {
          kind: 'union-closest-member',
          memberCount: memberTypes.length,
          closestMemberTypeName: closest.typeName,
          equallyCloseMemberTypeNames: equallyClose.map((c) => c.typeName),
        },
      } satisfies ValidationError)(closest.errors),
    );
  };

  const is = createIsFn<T>(validate);

  const fill: Type<T>['fill'] = (a) => (is(a) ? a : getDefaultType().fill(a));

  // Prunes with the first member type that matches the value.
  const prune = (a: T): T => {
    const matched = memberTypes.find((t) => t.is(a));

    return matched === undefined
      ? a
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (matched.prune(a) as T);
  };

  const baseType = {
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
    // Lets a union that takes this one as a member flatten it in.
    memberTypes,
  } as const satisfies Type<T> & UnionTypeInternals;

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
      shapeStructure: Arr.isFixedLengthTuple(1, shapeStructures)
        ? shapeStructures[0]
        : ({ kind: 'union', variants: shapeStructures } as const),
      excessProperty,
    } as UnionType<Types>;
  }

  return baseType as UnionType<Types>;
};

/**
 * How close a member is to a value it rejected.
 *
 * `score` is the number of checks the member failed minus the number it
 * passed, so a member is credited for what the value does satisfy. Plain error
 * counting would let a small unrelated member (one missing key) outrank a large
 * member the value nearly satisfies (two wrong fields out of ten), while a
 * ratio would do the opposite and let a large member win with a long list of
 * errors just because it also has many keys. Subtracting keeps both the failed
 * and the passed checks in absolute terms.
 *
 * Members with the same score are ordered by how much they satisfied, so the
 * one that recognized more of the value comes first.
 *
 * See `documents/union-closest-member-heuristic.md` for the scenarios these
 * rules were chosen against.
 */
type MemberCloseness = Readonly<{
  typeName: string;
  errors: readonly ValidationError[];
  satisfiedCheckCount: number;
  score: number;
}>;

const evaluateMember = (memberType: AnyType, a: unknown): MemberCloseness => {
  const errors = validationErrorsOf(memberType.validate(a));

  // A member cannot pass fewer than zero checks: a record that rejects excess
  // properties can report more errors than it has keys.
  const satisfiedCheckCount = Math.max(
    0,
    checkCountOf(memberType) - errors.length,
  );

  return {
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
 * How many checks a member performs on a value: one per key for a record, one
 * per element for a tuple, and a single check for everything else, which either
 * matches or does not. A record whose shape cannot be flattened to a single set
 * of keys (a union of shapes) also counts as one check.
 */
const checkCountOf = (memberType: AnyType): number => {
  if (hasRecordInternals(memberType)) {
    const shape = flattenShapeStructure(memberType.shapeStructure);

    return shape === undefined ? 1 : Object.keys(shape).length;
  }

  if (hasTupleInternals(memberType)) {
    return memberType.elementTypes.length;
  }

  return 1;
};

const validationErrorsOf = (
  result: Result<unknown, readonly ValidationError[]>,
): readonly ValidationError[] =>
  Result.isErr(result) ? result.value : ([] as const);

type UnionType<Types extends NonEmptyTuple<AnyType>> = Type<
  UnionTypeValue<Types>
>;

type UnionTypeValue<Types extends NonEmptyTuple<AnyType>> =
  TsFortressInternal.UnionTypeValueImpl<Types>;

namespace TsFortressInternal {
  export type UnionTypeValueImpl<Types extends NonEmptyTuple<AnyType>> =
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
