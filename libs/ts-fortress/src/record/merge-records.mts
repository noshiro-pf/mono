import {
  Arr,
  expectType,
  hasKey,
  isRecord,
  memoizeFunction,
  Obj,
  tp,
} from 'ts-data-forge';
import { Optional, panic, Result } from 'ts-std-forge';
import type {
  Intersection,
  NonEmptyTuple,
  Primitive,
  UnknownRecord,
} from 'ts-type-forge';
import { intersection, union } from '../compose/index.mjs';
import { deepMerge } from '../deep-merge.mjs';
import { enumType } from '../enum/index.mjs';
import { literal } from '../other-types/index.mjs';
import {
  type ExcessPropertyOption,
  type RecordView,
  type Type,
  type TypeOf,
  type UnknownShape,
  type UnknownType,
  asType,
  copyTypeByDescriptors,
  expandShapeParts,
  recordViewOf,
  recordViewWithoutResolvingOf,
  unionMembersOf,
} from '../type.mjs';
import {
  createAssertFn,
  createCastFn,
  createIsFn,
  toIntersectionString,
} from '../utils/index.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';

export const mergeRecords = <
  const Types extends NonEmptyTuple<Type<UnknownRecord>>,
>(
  recordTypes: Types,
  options?: MergeRecordsOptions,
): MergeRecordsType<Types> => {
  const merged = tryMergeRecordTypes(recordTypes, options);

  if (Result.isErr(merged)) {
    const { key, members } = merged.value;

    panic(
      `mergeRecords: no value of "${key}" satisfies all of ${members.map((member) => member.typeName).join(', ')}`,
    );
  }

  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  return merged.value as MergeRecordsType<Types>;
};

const MERGE_RECORDS_MAX_VARIANTS = 10_000;

/**
 * The most combinations of the members' record branches that `intersectMembers`
 * merges when it looks for a default or a repair. Each costs a merge of records
 * and a validation by every member, so the search is held to a small constant;
 * past it, neither the default nor `fill` tries them.
 */
const MERGE_RECORDS_MAX_BRANCH_COMBINATIONS = 64;

/**
 * A list of members merged as records (see `mergeRecordsOnce`), reached from
 * `mergeCacheRoot` through one member at a time, each held weakly, so that an
 * entry goes once any of its members does.
 */
// An entry is kept while all its members live, whether or not a merged type
// that holds it does: a merge of module-level records is kept for the process,
// which is what lets a later merge or a deeper level of a value reuse it.
type MergeCacheNode = {
  mut_next: WeakMap<UnknownType, MergeCacheNode>;
};

const mergeCacheRoot: MergeCacheNode = {
  mut_next: new WeakMap<UnknownType, MergeCacheNode>(),
} as const;

const mut_mergedAt = new WeakMap<MergeCacheNode, MergeResult>();

/**
 * @internal The options `mergeRecords` takes, which `tryMergeRecordTypes`
 * takes too; a consumer spells `Parameters<typeof mergeRecords>[1]`.
 */
type MergeRecordsOptions = Partial<
  Readonly<{
    typeName: string;
    excessProperty: ExcessPropertyOption;
  }>
>;

/**
 * @internal The `Type` `mergeRecords` returns, computed from the arguments; a
 * consumer spells `ReturnType<typeof mergeRecords<…>>`.
 */
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

/** A key whose members accept no value in common (`key` is a dotted path). */
type Contradiction = Readonly<{
  key: string;
  members: NonEmptyTuple<UnknownType>;
}>;

type MergeResult = Result<Type<UnknownRecord>, Contradiction>;

const deriveStrictestExcessProperty = (
  types: readonly RecordView[],
): ExcessPropertyOption =>
  types.some((t) => t.excessProperty === 'reject') ? 'reject' : 'allow';

/**
 * The records `members` merged, built once per list of members when the merge
 * finishes (see the comment below for one that does not): every combination of
 * variants that shares a key of records would otherwise merge them again, and
 * so would each level a value of a pair of `recursion`s that share a key nests.
 */
// Each merge is bounded by `MERGE_RECORDS_MAX_VARIANTS` on its own, a nested
// one too, rather than all the merges one call makes by one budget: a merge
// that meets several lists of members at a shared key (one per combination of
// variants at most) makes one nested merge for each, and the search for an
// intersected key's default makes one for each combination of record branches
// (see `MERGE_RECORDS_MAX_BRANCH_COMBINATIONS`), each within the bound. That
// cost is what the records declare, multiplied out. Each nested merge that
// finishes is built once per list of members, when the merge that meets it is
// built or first used, and then reused; one that passes the bound throws each
// time it is tried, as a `recursion` whose definition throws does. A `fill`
// still tries the merged branches on each value it repairs, as it tries the
// members. A budget shared by one call would have to charge a merge reused from
// an earlier call too, or whether a call throws would depend on what ran before
// it.
const mergeRecordsOnce = (members: NonEmptyTuple<UnknownType>): MergeResult => {
  const node = members.reduce((parent, member) => {
    const found = parent.mut_next.get(member);

    if (found !== undefined) {
      return found;
    }

    const created: MergeCacheNode = {
      mut_next: new WeakMap<UnknownType, MergeCacheNode>(),
    } as const;

    parent.mut_next.set(member, created);

    return created;
  }, mergeCacheRoot);

  const cached = mut_mergedAt.get(node);

  if (cached !== undefined) {
    return cached;
  }

  // No options: the caller's `typeName` and `excessProperty` are the merged
  // record's own, and the records of a key keep theirs, of which the merge
  // takes the strictest, as it does for any records it is given.
  const merged = tryMergeRecordTypes(members, undefined);

  mut_mergedAt.set(node, merged);

  return merged;
};

/**
 * Whether `member` stores `undefined` as its default (as `optional` with
 * `forceUndefinedDefault` does), told without reading a getter, which may
 * resolve a `recursion` whose default is this key's.
 */
const forcesUndefinedDefault = (member: UnknownType): boolean => {
  const descriptor = Object.getOwnPropertyDescriptor(member, 'defaultValue');

  return (
    descriptor !== undefined &&
    descriptor.get === undefined &&
    descriptor.value === undefined
  );
};

/**
 * Whether `a` and `b` are the same type but for being optional and for their
 * default, as copies made by `optional`, `partial` and `required` are: both
 * validate by the same own `validate`, and every other own property is the same
 * value or the same getter, so they accept the same values, and fill, prune and
 * describe them alike. An annotated copy (`annotate`) is not one, nor is a
 * `Type` written as a class, whose `validate` is inherited and may read state
 * the descriptors do not show. Nor are two types built alike (two `string()`):
 * whether two types accept the same values cannot be told in general, so they
 * are merged as distinct members (see `mergeKey`). Where that intersects them,
 * the key accepts the same values as each, with a longer report and an `allOf`
 * schema.
 */
const isCopyOf = (a: UnknownType, b: UnknownType): boolean => {
  const aDescriptors = Object.getOwnPropertyDescriptors(a);

  const bDescriptors = Object.getOwnPropertyDescriptors(b);

  const keys = new Set<string>([
    ...Object.keys(aDescriptors),
    ...Object.keys(bDescriptors),
  ]);

  return (
    isRecord(a) &&
    hasKey(a, 'validate') &&
    Object.getPrototypeOf(a) === Object.getPrototypeOf(b) &&
    Array.from(keys).every(
      (key) =>
        key === 'optional' ||
        key === 'defaultValue' ||
        (aDescriptors[key]?.value === bDescriptors[key]?.value &&
          aDescriptors[key]?.get === bDescriptors[key]?.get),
    )
  );
};

/**
 * `members` with `member` added last. The same member declared again, or a copy
 * of one (see `isCopyOf`), adds nothing to require, so one of the two is kept,
 * last, where the later declaration puts it (the defaults are searched from the
 * last member): the required one; of two optional ones, one that forces an
 * `undefined` default (see `forcesUndefinedDefault`), which the key's default
 * needs; of two required ones, one that does not, since the key rejects
 * `undefined`; else the later one. A required copy is kept over an optional one
 * even when it keeps a forced `undefined` default (see `makeRequired`), since
 * the key is required. Merging a copy instead would intersect a type with
 * itself, or merge a union of records with itself
 * (`mergeRecords([R, partial(R)])`), which squares its variants.
 */
const withMember = (
  members: NonEmptyTuple<UnknownType>,
  member: UnknownType,
): NonEmptyTuple<UnknownType> => {
  const earlier = members.find((m) => m === member || isCopyOf(m, member));

  if (earlier === undefined) {
    return Arr.toPushed(members, member);
  }

  const keepsEarlier =
    earlier.optional !== member.optional
      ? earlier.optional !== true
      : forcesUndefinedDefault(earlier) !== forcesUndefinedDefault(member) &&
        forcesUndefinedDefault(earlier) === (earlier.optional === true);

  return Arr.toPushed(
    members.filter((m) => m !== earlier),
    keepsEarlier ? earlier : member,
  );
};

/**
 * Merges one combination of variants. A key one shape declares keeps its
 * member; a key several declare gets a member that requires all of them (see
 * `mergeKey`).
 */
const mergeShapes = (
  shapes: readonly UnknownShape[],
): Result<UnknownShape, Contradiction> => {
  const mut_members = new Map<string, NonEmptyTuple<UnknownType>>();

  for (const shape of shapes) {
    for (const [key, member] of Object.entries(shape)) {
      const earlier = mut_members.get(key);

      mut_members.set(
        key,
        earlier === undefined ? [member] : withMember(earlier, member),
      );
    }
  }

  const mut_entries: (readonly [string, Type<unknown>])[] = [];

  for (const [key, members] of mut_members) {
    // A key shared with a union gets one merged member per variant, as the
    // variant gets its own record: a constant factor on what each variant costs
    // already, and a member's default is searched only when that variant's is
    // read.
    const merged = mergeKey(key, members);

    if (Result.isErr(merged)) {
      return merged;
    }

    mut_entries.push(tp(key, asType(merged.value)));
  }

  return Result.ok(Object.fromEntries(mut_entries));
};

/** Whether `value` is one of `values`, which may be of a narrower type. */
const isOneOf = (values: readonly unknown[], value: unknown): boolean =>
  values.includes(value);

/**
 * The default `member` stores as an own data property, if it does: a getter is
 * not run while the merge is built, since it may read the binding the merge
 * initializes.
 */
const storedDefaultOf = (member: UnknownType): Optional<unknown> => {
  const descriptor = Object.getOwnPropertyDescriptor(member, 'defaultValue');

  return descriptor === undefined || descriptor.get !== undefined
    ? Optional.none
    : Optional.some(descriptor.value);
};

/**
 * Whether `member` is an `enumType` or a `literal`, whose `fill` runs no other
 * type's code (a union's runs its default type's, which may be a `recursion`).
 */
const isEnumOrLiteral = (member: UnknownType): boolean =>
  member.structure?.kind === 'enum' || member.structure?.kind === 'literal';

/**
 * What an `enumType` or a `literal` among `members` defaults to, by its own
 * `fill` of its stored default (a member made optional with
 * `forceUndefinedDefault` stores `undefined`, which its `fill` repairs to the
 * value it would default to otherwise), for the last such member for which that
 * is one of `values`.
 */
const listedDefaultOf = (
  members: NonEmptyTuple<UnknownType>,
  values: NonEmptyTuple<Primitive>,
): Optional<Primitive> =>
  Arr.findLast(
    Arr.generate(function* () {
      for (const member of members) {
        const stored = storedDefaultOf(member);

        if (isEnumOrLiteral(member) && Optional.isSome(stored)) {
          yield member.fill(Optional.unwrap(stored));
        }
      }
    }),
    (value): value is Primitive => isOneOf(values, value),
  );

/** Whether `literal` takes `value`, which `null`, `undefined` and a symbol are not. */
const isLiteralValue = (
  value: Primitive,
): value is string | number | bigint | boolean =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'bigint' ||
  typeof value === 'boolean';

/**
 * A `literal` or `enumType` of `values`, which keeps a discriminant a literal
 * for `toJsonSchema`. Its default is that of `listedDefaultOf`, else the first
 * of `values`.
 */
const listedType = (
  members: NonEmptyTuple<UnknownType>,
  values: NonEmptyTuple<Primitive>,
): UnknownType => {
  if (Arr.isFixedLengthTuple(1, values) && isLiteralValue(values[0])) {
    return literal(values[0]);
  }

  return enumType(values, {
    defaultValue: Optional.unwrapOr(
      listedDefaultOf(members, values),
      values[0],
    ),
  });
};

/**
 * The values a `literal`, an `enumType` or a union of those lists, or
 * `undefined` for any other type.
 */
const listedValuesOf = (
  type: UnknownType,
): readonly Primitive[] | undefined => {
  const { structure } = type;

  if (structure?.kind === 'enum') {
    return structure.values;
  }

  if (structure?.kind === 'literal') {
    return [structure.value] as const;
  }

  if (structure?.kind === 'union') {
    const lists = structure.memberTypes.map(listedValuesOf);

    return lists.every((list) => list !== undefined) ? lists.flat() : undefined;
  }

  return undefined;
};

/**
 * Whether `is` of `type` runs no `recursion` and no hand-written `Type`, so
 * that it can be called while the merge is built.
 */
const testsWithoutResolving = (type: UnknownType): boolean => {
  const { structure } = type;

  return (
    structure !== undefined &&
    structure.kind !== 'recursion' &&
    (structure.kind === 'union' || structure.kind === 'intersection'
      ? structure.memberTypes.every(testsWithoutResolving)
      : (structure.kind !== 'refine' && structure.kind !== 'brand') ||
        testsWithoutResolving(structure.baseType))
  );
};

/**
 * `type.is(value)` for a type `testsWithoutResolving` accepts, without reading a
 * default. An intersection, a refinement and a brand test by `validate`, which a
 * union fails by reading its members' defaults to report the closest one; a
 * default may resolve a `recursion` while the merge is built. So each part is
 * tested first, by its own `is` where it is a union.
 */
const acceptsWithoutResolving = (
  type: UnknownType,
  value: unknown,
): boolean => {
  const { structure } = type;

  if (structure?.kind === 'union') {
    return structure.memberTypes.some((m) => acceptsWithoutResolving(m, value));
  }

  if (structure?.kind === 'intersection') {
    return structure.memberTypes.every((m) =>
      acceptsWithoutResolving(m, value),
    );
  }

  // Once the base accepts the value, its `validate` succeeds without reporting.
  return structure?.kind === 'refine' || structure?.kind === 'brand'
    ? acceptsWithoutResolving(structure.baseType, value) && type.is(value)
    : type.is(value);
};

/**
 * The member of a key that several records declare: a value has to satisfy all
 * of them, as the static type (an intersection) says. The key is optional only
 * when every member is. By what the members are:
 *
 * - all records: merged as records, by `mergeRecords`'s own merge;
 * - one or more list their values (`literal`, `enumType`, a union of those):
 *   the values every member accepts, as a `literal` or an `enumType` (see
 *   `listedType`), so that a discriminant every record repeats stays a
 *   literal;
 * - otherwise: their intersection (see `intersectMembers`).
 *
 * Members that accept no value in common contradict each other: the key can
 * then only be absent if it is optional, and is an error otherwise, which
 * leaves the combination of variants out (see `tryMergeRecordTypes`).
 *
 * Nothing here resolves a `recursion` or reads a getter default: the merge may
 * be what the binding a `recursion` refers to is being initialized to. Records
 * behind a `recursion` are merged on first use instead (see
 * `intersectMembers`).
 */
const mergeKey = (
  key: string,
  members: NonEmptyTuple<UnknownType>,
): Result<UnknownType, Contradiction> => {
  if (Arr.isFixedLengthTuple(1, members)) {
    return Result.ok(members[0]);
  }

  const isOptionalKey = members.every((m) => m.optional === true);

  // The key's member, optional when the key is, and then defaulting to
  // `undefined` when any member forces it: a member forces `undefined` to stop
  // a `recursion`'s default, which the merged default may read otherwise.
  // `required` of the merge keeps that default, as it does a member's (see
  // `makeRequired`).
  //
  // A required key tests an optional member by the member's own `is`, so it
  // rejects the `undefined` that `record` lets an optional key hold. The static
  // type accepts it there only without `exactOptionalPropertyTypes`, and
  // accepting it would make every kind of merged member below a union with
  // `undefined`.
  const asKey = (type: UnknownType): UnknownType =>
    isOptionalKey
      ? optional(type, {
          forceUndefinedDefault: members.some(forcesUndefinedDefault),
        })
      : type;

  const absentOnly = (): Result<UnknownType, Contradiction> =>
    Result.ok(
      optional(intersectMembers(members, true), {
        forceUndefinedDefault: true,
      }),
    );

  if (members.every((m) => recordViewWithoutResolvingOf(m) !== undefined)) {
    const merged = mergeRecordsOnce(members);

    return Result.isOk(merged)
      ? Result.ok(asKey(merged.value))
      : isOptionalKey
        ? absentOnly()
        : Result.err({
            key: `${key}.${merged.value.key}`,
            members: merged.value.members,
          });
  }

  const listed = Arr.findLast(members, (m) => listedValuesOf(m) !== undefined);

  if (Optional.isSome(listed) && members.every(testsWithoutResolving)) {
    const ownValues = listedValuesOf(Optional.unwrap(listed)) ?? ([] as const);

    // In the order the last member that lists its values lists them.
    // Once each: a union may list a value more than once.
    const common = Arr.uniq(
      ownValues.filter((v) =>
        members.every((m) => acceptsWithoutResolving(m, v)),
      ),
    );

    if (!Arr.isNonEmpty(common)) {
      return isOptionalKey ? absentOnly() : Result.err({ key, members });
    }

    // A required member that lists these values alone, and stores one of them
    // as its default, is kept as it is.
    const standing = Arr.findLast(
      members,
      (m) =>
        m.optional !== true &&
        isEnumOrLiteral(m) &&
        (listedValuesOf(m) ?? []).every((v) => common.includes(v)) &&
        Optional.isSome(storedDefaultOf(m)) &&
        isOneOf(common, Optional.unwrap(storedDefaultOf(m))),
    );

    return Result.ok(
      asKey(
        Optional.isSome(standing)
          ? Optional.unwrap(standing)
          : listedType(members, common),
      ),
    );
  }

  return Result.ok(asKey(intersectMembers(members, isOptionalKey)));
};

/**
 * The intersection of `members`. Once a `recursion` among them can be resolved
 * (on first use), members that all are records validate, fill and prune as the
 * records merged. Otherwise `prune` merges what each member keeps of the value
 * (see `deepMerge`), and `fill` first tries the members' repairs merged the
 * same way, which repairs records that members wrap in an array element by
 * element, and those in a union by each union's own repair (see `union`'s
 * `fill`), as a union of the records merged would.
 * The default, and then `fill`, look for a value every member accepts: among
 * the members' own defaults and repairs (from the last), their union branches',
 * then their record branches merged, one branch of each member.
 * When none does, the default is the records merged's where the members are
 * records, else the members' defaults merged if every member accepts them;
 * else an optional key defaults to `undefined` and any other to the last
 * member's default, as before shared keys were checked against every member:
 * the members may contradict each other in a way only a value tells (a `number`
 * and a `string`, two ranges that do not overlap), which no check when the
 * merge is built finds, or agree on a value the search does not find (two
 * ranges whose defaults both lie outside their overlap).
 */
const intersectMembers = (
  members: NonEmptyTuple<UnknownType>,
  isOptionalKey: boolean,
): UnknownType => {
  const reversed = Arr.toReversed(members);

  // `intersection` reads its default type only for `defaultValue` and `fill`,
  // both replaced below. Members that wrap records in a union or an array
  // validate and are described as `intersection` does any parts: each record
  // checks excess keys against its own shape, so a `strictRecord` rejects the
  // keys the others add.
  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  const both: UnknownType = intersection(members, members[0] as Type<never>);

  const mergedRecordsOf = (
    types: NonEmptyTuple<UnknownType>,
  ): UnknownType | undefined => {
    if (types.some((t) => recordViewOf(t) === undefined)) {
      return undefined;
    }

    const merged = mergeRecordsOnce(types);

    return Result.isOk(merged) ? merged.value : undefined;
  };

  // Built on first use, since a `recursion` among the members can be resolved
  // only then, so a panic of the merge (too many variants) comes then too, as
  // an error in a `recursion`'s definition does. A contradiction found then
  // leaves the members intersected, which no value satisfies. The merge is the
  // one `mergeRecordsOnce` keeps for these members, so the same members met
  // again at a deeper level of a value reuse it.
  //
  // The key then validates as the records merged, but `structure` stays the
  // members' intersection, which `toJsonSchema` writes as an `allOf` of them:
  // a `strictRecord` member makes that schema reject the keys the other members
  // add, which `validate` accepts. Writing the merged records needs a
  // `structure` that can be read before the recursion resolves, which neither
  // `toJsonSchema` nor the record views support yet.
  const getMergedAsRecords = memoizeFunction(() => mergedRecordsOf(members));

  const effective = (): UnknownType => getMergedAsRecords() ?? both;

  const is = (a: unknown): boolean => effective().is(a);

  // Each candidate is made and read only once those before it are rejected,
  // since a default may resolve a `recursion`: the members first, then their
  // union branches, then their record branches merged, one branch of each
  // member. Each list is made once; a merge of branches is kept by
  // `mergeRecordsOnce`. A combination whose merge passes
  // `MERGE_RECORDS_MAX_VARIANTS` throws when the search reaches it, as the
  // merge would when built: the bound is a panic, which `Result.fromThrowable`
  // does not catch, and telling it from a contradiction would take a third kind
  // of result through every nested merge.
  const stages: readonly (() => readonly (() => UnknownType | undefined)[])[] =
    [
      memoizeFunction(() => reversed.map((m) => () => m)),
      memoizeFunction(() =>
        reversed.flatMap((m) =>
          unionMembersOf(m)
            .filter((b) => b !== m)
            .map((b) => () => b),
        ),
      ),
      memoizeFunction(() => {
        const recordBranches = members.map((m) =>
          unionMembersOf(m).filter((b) => recordViewOf(b) !== undefined),
        );

        const count = recordBranches.reduce((acc, bs) => acc * bs.length, 1);

        return count > MERGE_RECORDS_MAX_BRANCH_COMBINATIONS
          ? []
          : Arr.cartesianProduct(recordBranches)
              .filter(Arr.isNonEmpty)
              .map((branches) => () => mergedRecordsOf(branches));
      }),
    ] as const;

  const firstAccepted = (
    read: (type: UnknownType) => unknown,
    otherwise: () => unknown,
  ): unknown => {
    for (const stage of stages) {
      for (const candidate of stage()) {
        const type = candidate();

        if (type === undefined) {
          continue;
        }

        const value = read(type);

        if (is(value)) {
          return value;
        }
      }
    }

    return otherwise();
  };

  // A value of the key is a value of every member, which prunes it to the paths
  // it declares, so the results merged keep the paths some member declares.
  // Repairs and defaults are merged the same way, and the result checked, since
  // members may give different shapes (one `null`, another a record). A member
  // that accepts a value keeps it whole, so where it keeps a key that another
  // member repairs, the merged repair fails and the search follows.
  const mergedResultOf = (
    a: unknown,
    run: (member: UnknownType) => unknown,
  ): unknown =>
    Arr.tail(members).reduce(
      (acc: unknown, m) => deepMerge(a, acc, run(m)),
      run(members[0]),
    );

  // The members' defaults come before the records merged: a `recursion` may
  // have a default of its own to end its self-reference, which the merged
  // records' default, built from their shapes, would not read.
  const getDefaultValue = memoizeFunction((): unknown =>
    firstAccepted(
      (type) => type.defaultValue,
      // The last member's default is not a panic, though for a required key it
      // fails `is`: `fill` falls back to it, and a `fill` that throws cannot
      // repair the stored data it is for.
      () => {
        const merged = getMergedAsRecords();

        if (merged !== undefined) {
          return merged.defaultValue;
        }

        // Read only here, after each member's own default: reading them all
        // first could resolve a `recursion` whose default is not needed.
        const defaults = mergedResultOf(undefined, (m) => m.defaultValue);

        return is(defaults)
          ? defaults
          : isOptionalKey
            ? undefined
            : reversed[0].defaultValue;
      },
    ),
  );

  const fill = (a: unknown): unknown => {
    const merged = getMergedAsRecords();

    if (merged !== undefined) {
      return merged.fill(a);
    }

    if (is(a)) {
      return a;
    }

    const repaired = mergedResultOf(a, (m) => m.fill(a));

    return is(repaired)
      ? repaired
      : firstAccepted((type) => type.fill(a), getDefaultValue);
  };

  const prune = (a: unknown): unknown => {
    const merged = getMergedAsRecords();

    return merged !== undefined
      ? asType(merged).prune(a)
      : mergedResultOf(a, (m) => asType(m).prune(a));
  };

  const validate: UnknownType['validate'] = (a) => effective().validate(a);

  // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
  return copyTypeByDescriptors(both, {
    ...Object.getOwnPropertyDescriptors(both),
    defaultValue: { get: getDefaultValue, enumerable: true },
    fill: { value: fill, enumerable: true },
    prune: { value: prune, enumerable: true },
    validate: { value: validate, enumerable: true },
    is: { value: createIsFn(validate), enumerable: true },
    assertIs: { value: createAssertFn(validate), enumerable: true },
    cast: { value: createCastFn(validate), enumerable: true },
  }) as UnknownType;
};

/**
 * `mergeRecords` without its computed result type. A combination of variants in
 * which a key's members contradict each other is left out, as its static type,
 * `never`, leaves it out of the union; when every combination is, the first
 * one's contradiction is returned.
 */
const tryMergeRecordTypes = (
  recordTypes: NonEmptyTuple<UnknownType>,
  options: MergeRecordsOptions | undefined,
): MergeResult => {
  const views = recordTypes.map(recordViewOf);

  if (!views.every((view): view is RecordView => view !== undefined)) {
    panic(
      'Expected a record type but received a non-record type in mergeRecords',
    );
  }

  const typeNameFilled: string =
    options?.typeName ??
    `(${toIntersectionString(recordTypes.map((a) => a.typeName))})`;

  // Each variant is kept as the shapes it is made of, so that a key the parts
  // of an intersection share requires every part's member too.
  const expandedShapesPerType = views.map((view) =>
    expandShapeParts(view.shapeStructure),
  );

  const estimatedVariantCount = expandedShapesPerType.reduce(
    (acc, shapes) => acc * shapes.length,
    1,
  );

  if (estimatedVariantCount > MERGE_RECORDS_MAX_VARIANTS) {
    panic(
      `mergeRecords would create ${estimatedVariantCount} record variants, exceeding the limit of ${MERGE_RECORDS_MAX_VARIANTS}. ` +
        'This could lead to excessive memory or CPU usage. Consider simplifying the record types or reducing union/intersection nesting.',
    );
  }

  // {a} & ({b} | {c}) = ({a} & {b}) | ({a} & {c})
  const combinations = Arr.map(
    Arr.cartesianProduct(expandedShapesPerType),
    (shapes) => mergeShapes(shapes.flat()),
  );

  const mergedShapes = combinations.filter(Result.isOk).map((c) => c.value);

  if (!Arr.isNonEmpty(mergedShapes)) {
    // Every combination is an error here, and there is one at least, since
    // every record has a variant.
    return (
      combinations.find(Result.isErr) ??
      panic('mergeRecords: a record without a variant')
    );
  }

  const excessProperty =
    options?.excessProperty ?? deriveStrictestExcessProperty(views);

  if (Arr.isFixedLengthTuple(1, mergedShapes)) {
    return Result.ok(
      record(mergedShapes[0], { typeName: typeNameFilled, excessProperty }),
    );
  }

  const variants: readonly Type<UnknownRecord>[] = Arr.map(
    mergedShapes,
    (shape) => record(shape, { excessProperty }),
  );

  return Result.ok(
    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    union(variants as NonEmptyTuple<Type<UnknownRecord>>, {
      typeName: typeNameFilled,
    }),
  );
};

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
