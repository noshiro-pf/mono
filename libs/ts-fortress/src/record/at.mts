import { Arr } from 'ts-data-forge';
import { type IndexOfTuple, type UnknownRecord } from 'ts-type-forge';
import { union } from '../compose/index.mjs';
import {
  attachConstraints,
  type ConstraintsCarrierOf,
  hasConstraints,
} from '../constraints/index.mjs';
import { undefinedType } from '../primitives/index.mjs';
import {
  expandShapeStructure,
  hasRecordInternals,
  hasTupleInternals,
  type Type,
  type TypeOf,
  type UnknownShape,
  type WithShape,
} from '../type.mjs';
import { isOptionalProperty } from './optional.mjs';

/**
 * Extracts the {@link Type} stored at a single key of a record type built by
 * `record` or `strictRecord`.
 *
 * Those carry the shape they were built from, so what comes back is the very
 * member type the shape holds — constraints included, which is what makes
 * `at(User, 'age').constraints.max` read the same value the schema validates
 * against. An optional member widens to `T | undefined`, as `R[K]` does, and
 * still carries the member's constraints.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const User = t.record({
 *   age: t.number(0, { int: true, min: 0, max: 120 }),
 * });
 *
 * const max: 120 = t.at(User, 'age').constraints.max;
 *
 * // equivalently, straight off the record type
 * const sameMax: 120 = User.shape.age.constraints.max;
 * ```
 */
export function at<
  const S extends UnknownShape,
  const K extends keyof S & string,
>(
  recordType: Type<UnknownRecord> & WithShape<S>,
  key: K,
): ShapeMemberType<S, K>;

/**
 * Extracts the {@link Type} stored at a single key of a record type.
 *
 * The first argument must be a record type (i.e. it must extend
 * `Type<UnknownRecord>`, like {@link pick} and {@link keyof}), and the second
 * argument is constrained to the keys declared on that record.
 *
 * The record type may be a simple record, an intersection (e.g. the result of
 * {@link mergeRecords}), a union, a recursive type, or any combination of
 * these — the underlying shape is expanded and, when a key resolves to
 * multiple member types (as in a union), the resulting types are combined with
 * {@link union}.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const ymd = t.record({
 *   year: t.number(1900),
 *   month: t.number(1),
 *   date: t.number(1),
 * });
 *
 * const year = t.at(ymd, 'year'); // Type<number>
 *
 * year.is(2000); // true
 * ```
 */
export function at<
  const R extends UnknownRecord,
  const K extends keyof R & string,
>(recordType: Type<R>, key: K): Type<R[K]>;

/**
 * Extracts the {@link Type} stored at a single index of a tuple type.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const tup = t.tuple([t.number(), t.string(), t.boolean()]);
 *
 * const second = t.at(tup, 1); // Type<string>
 *
 * second.is('hello'); // true
 * ```
 */
export function at<
  const T extends readonly unknown[],
  const N extends IndexOfTuple<T>,
>(tupleType: Type<T>, index: N): Type<T[N]>;

export function at(
  type: Type<UnknownRecord> | Type<readonly unknown[]>,
  keyOrIndex: string | number,
): Type<unknown> {
  // --- Tuple index access ---
  if (typeof keyOrIndex === 'number') {
    if (!hasTupleInternals(type)) {
      throw new Error(`Expected a tuple type but received: ${type.typeName}`);
    }

    const elementType = type.elementTypes[keyOrIndex];

    if (elementType === undefined) {
      throw new Error(
        `Index ${keyOrIndex} is out of range for tuple type: ${type.typeName}`,
      );
    }

    return elementType;
  }

  // --- Record key access ---
  if (!hasRecordInternals(type)) {
    throw new Error(`Expected a record type but received: ${type.typeName}`);
  }

  const shapes = expandShapeStructure(type.shapeStructure);

  const memberTypes: readonly Type<unknown>[] = shapes.flatMap((shape) => {
    const memberType = shape[keyOrIndex];

    return memberType === undefined ? [] : [memberType];
  });

  // If the key is optional in any member, the accessed value may be undefined,
  // matching the `T | undefined` produced by `R[K]` for optional keys.
  const hasOptionalMember = memberTypes.some(isOptionalProperty);

  const collected: readonly Type<unknown>[] = hasOptionalMember
    ? Arr.toPushed(memberTypes, undefinedType)
    : memberTypes;

  if (Arr.isMinLengthTuple(2, collected)) {
    const unionType = union(collected, {
      typeName: `${type.typeName}[${JSON.stringify(keyOrIndex)}]`,
    });

    // A lone optional member widened with `undefined`: its constraints still
    // describe the defined branch, so carry them over rather than losing them
    // on the way through `union`.
    const soleMember = Arr.isFixedLengthTuple(1, memberTypes)
      ? memberTypes[0]
      : undefined;

    return soleMember !== undefined && hasConstraints(soleMember)
      ? attachConstraints(unionType, soleMember.constraints)
      : unionType;
  }

  if (Arr.isNonEmpty(collected)) {
    return collected[0];
  }

  throw new Error(
    `Key ${JSON.stringify(keyOrIndex)} does not exist on record type: ${type.typeName}`,
  );
}

/**
 * The type {@link at} returns for a key of a shape-carrying record type: the
 * shape's own member type, or — for an optional member — the `T | undefined`
 * the runtime builds, still carrying the member's constraints.
 */
type ShapeMemberType<S extends UnknownShape, K extends keyof S> =
  S[K] extends Readonly<{ optional: true }>
    ? Type<TypeOf<S[K]> | undefined> & ConstraintsCarrierOf<S[K]>
    : S[K];
