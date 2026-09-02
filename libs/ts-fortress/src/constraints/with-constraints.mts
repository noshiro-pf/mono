import { hasKey, isRecord, tp } from 'ts-data-forge';
import { type ReadonlyRecord, type UnknownRecord } from 'ts-type-forge';
import { type AnyType, type Type } from '../type.mjs';

/**
 * The carrier of the constraint values a {@link Type} was created with.
 *
 * Constrained primitives (`number`, `string`, `bigint` and the branded types
 * built on them) expose the constraints they were given as
 * a plain, fully-enumerated record, so that the numbers a schema validates
 * against can also drive a form (`min` / `max` / `step` on an `<input>`, a
 * character counter, ...) instead of being written down a second time.
 *
 * Every key of the constraint set is present, so a constraint that _was_
 * specified is read without `?.`; one that was not is typed `undefined`.
 */
export type WithConstraints<C> = Readonly<{ constraints: C }>;

/** A {@link Type} that also carries the constraint values it was created with. */
export type ConstrainedType<A, C> = Type<A> & WithConstraints<C>;

/**
 * The constraint values carried by a type, or `never` for a type that carries
 * none.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const Age = t.number(0, { int: true, min: 0, max: 120 });
 *
 * type AgeConstraints = t.ConstraintsOf<typeof Age>;
 * //   ^? { readonly int: true; readonly min: 0; readonly max: 120; ... }
 * ```
 */
export type ConstraintsOf<T extends AnyType> =
  T extends WithConstraints<infer C> ? C : never;

/** The empty constraint set — the type was created without any constraint. */
export type NoConstraints = ReadonlyRecord<never, never>;

/**
 * @internal The constraints carrier for an inferred `C`, or `unknown` when
 * nothing was inferred. `X & unknown` is `X`, so an unconstrained base type
 * propagates no `constraints` property at all rather than an empty one.
 *
 * `unknown` rather than `never` is the "nothing inferred" marker so that the
 * `baseType` parameter it pairs with (`Type<A> & Partial<WithConstraints<C>>`)
 * still accepts a constrained type when a caller pins the earlier type
 * arguments by hand and leaves `C` at its default — `{ constraints?: never }`
 * would reject it.
 */
export type ConstraintsCarrier<C> = unknown extends C
  ? unknown
  : WithConstraints<C>;

/**
 * @internal The constraints carrier of a type, or `unknown` for a type that
 * carries none — the {@link ConstraintsCarrier} counterpart of
 * {@link ConstraintsOf}, for re-attaching a type's constraints to a type
 * derived from it.
 */
export type ConstraintsCarrierOf<T extends AnyType> =
  T extends WithConstraints<infer C> ? WithConstraints<C> : unknown;

/**
 * @internal Every key of `All`, taking the value `C` specifies for it and
 * `undefined` for the keys `C` leaves out. `-?` is what fixes an unspecified
 * key to `undefined` rather than making it optional, which is the difference
 * between `constraints.max` and `constraints.max?.`.
 */
export type FillConstraints<All extends UnknownRecord, C> = Readonly<{
  [K in keyof All]-?: K extends keyof C ? C[K] : undefined;
}>;

/**
 * Attaches constraint values to a type, so that they can be read back off the
 * type object.
 *
 * @example
 * ```ts
 * import * as t from 'ts-fortress';
 *
 * const Age = t.number(0, { min: 0, max: 120 });
 *
 * const max: 120 = Age.constraints.max;
 *
 * const step: undefined = Age.constraints.step;
 * ```
 */
export const attachConstraints = <A, C>(
  type: Type<A>,
  constraints: C,
): ConstrainedType<A, C> =>
  // Property descriptors rather than a spread: `union`, `record`, `recursion`
  // and the array types expose `defaultValue` as a lazy, memoized getter, and
  // a spread would call it here — which for a recursive type never
  // terminates — and freeze whatever it returned into a plain value.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(type),
      constraints: { value: constraints, enumerable: true },
    },
  ) as ConstrainedType<A, C>;

/** Runtime check for a type that carries constraint values. */
export const hasConstraints = <T extends AnyType>(
  t: T,
): t is T & WithConstraints<UnknownRecord> => hasConstraintsImpl(t);

const hasConstraintsImpl = (t: unknown): t is WithConstraints<UnknownRecord> =>
  isRecord(t) && hasKey(t, 'constraints') && isRecord(t.constraints);

/**
 * @internal Copies the constraint values of `source` onto `target`, leaving
 * `target` untouched when `source` carries none.
 */
export const propagateConstraints = <A, C>(
  target: Type<A>,
  source: Partial<WithConstraints<C>>,
): Type<A> & ConstraintsCarrier<C> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  (source.constraints === undefined
    ? target
    : attachConstraints(target, source.constraints)) as Type<A> &
    ConstraintsCarrier<C>;

/**
 * @internal Expands the constraints a type was created with into a record
 * carrying every key of `All`, with the unspecified ones set to `undefined`.
 */
export const fillConstraints = <
  All extends UnknownRecord,
  C extends Partial<All>,
>(
  allKeys: readonly (keyof All & string)[],
  constraints: C | undefined,
): FillConstraints<All, C> => {
  const source: Partial<All> | undefined = constraints;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Object.fromEntries(
    allKeys.map((key) => tp(key, source?.[key])),
  ) as FillConstraints<All, C>;
};
